import { Handler, HandlerResponse } from "@netlify/functions";

// Strict Interfaces for Google Sheets API
interface ColorObj {
  red?: number;
  green?: number;
  blue?: number;
}

interface CellData {
  formattedValue?: string;
  effectiveFormat?: {
    backgroundColor?: ColorObj;
  };
}

interface RowData {
  values?: CellData[];
}

interface SheetProperties {
  title?: string;
}

interface Sheet {
  properties?: SheetProperties;
  data?: { rowData?: RowData[] }[];
}

interface SpreadsheetData {
  properties?: SheetProperties;
  sheets?: Sheet[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

const COLOR_TARGETS = [
  { tag: "dropping", r: 255, g: 0, b: 0 },
  { tag: "rising", r: 0, g: 255, b: 0 },
  { tag: "rising", r: 56, g: 118, b: 29 },
  { tag: "deflated", r: 74, g: 134, b: 232 },
  { tag: "maximum", r: 255, g: 153, b: 0 },
  { tag: "maximum", r: 230, g: 145, b: 56 },
  { tag: "hyped", r: 0, g: 255, b: 255 },
  { tag: "varies", r: 142, g: 124, b: 195 },
  { tag: "gatekept", r: 166, g: 77, b: 121 },
  { tag: "gatekept", r: 255, g: 0, b: 255 },
  { tag: "inflated", r: 180, g: 95, b: 6 },
  { tag: "unstable", r: 118, g: 165, b: 175 },
  { tag: "black-marketed", r: 67, g: 67, b: 67 },
  { tag: "stable", r: 252, g: 229, b: 205 },
  { tag: "stable", r: 255, g: 242, b: 204 },
  { tag: "stable", r: 207, g: 226, b: 243 },
  { tag: "stable", r: 255, g: 255, b: 255 }
];

const VALID_TIERS = ["S", "A", "B", "C", "Pure", "Oddities", "Untiered"];
const VALID_STATUSES = [
  "stable", "unstable", "rising", "dropping", "inflated", "deflated",
  "varies", "maximum", "hyped", "gatekept", "black-marketed"
];

function getTagFromColor(colorObj?: ColorObj): { tag: string, error?: boolean } {
  // Missing formatting legitimately defaults to stable
  if (!colorObj || (colorObj.red == null && colorObj.green == null && colorObj.blue == null)) {
    return { tag: "stable" };
  }

  const r = Math.round((colorObj.red || 0) * 255);
  const g = Math.round((colorObj.green || 0) * 255);
  const b = Math.round((colorObj.blue || 0) * 255);

  // Explicit white backgrounds are stable
  if (r === 255 && g === 255 && b === 255) return { tag: "stable" };
  // Fallback for sometimes-empty objects parsing as pure black unintentionally
  if (r === 0 && g === 0 && b === 0 && colorObj.red === undefined) return { tag: "stable" };

  let bestTag = "stable", minDistance = Infinity;

  for (const target of COLOR_TARGETS) {
    const distance = Math.sqrt(
      Math.pow(r - target.r, 2) + Math.pow(g - target.g, 2) + Math.pow(b - target.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      bestTag = target.tag;
    }
  }

  // Preserve existing 100 Euclidean distance tolerance.
  if (minDistance < 100) return { tag: bestTag };
  
  // If the color is too far from any known target, explicitly flag it for validation.
  return { tag: "UNKNOWN_COLOR", error: true };
}

function jsonResponse(
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): HandlerResponse {
  const allowedOrigin = process.env.URL || "https://astd-value-list.netlify.app";

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, "");
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
    return jsonResponse(400, { error: "Query parameters are not allowed." });
  }

  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const SHEET_ID = process.env.SPREADSHEET_ID;

  if (!API_KEY || !SHEET_ID) {
    return jsonResponse(500, { error: "Missing Environment Variables (GOOGLE_SHEETS_API_KEY or SPREADSHEET_ID)" });
  }

  const ranges = [
    "S Tier!A:H",
    "A Tier!A:H",
    "B Tier!A:H",
    "C Tier!A:H",
    "Pure Tier!A:H",
    "Oddities!A:H",
    "Untiered!A:H",
    "Home!A:K",
    "Extra Notices!A:B"
  ];
  const batchRanges = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?${batchRanges}&includeGridData=true&key=${API_KEY}`;
    const response = await fetch(url);
    const data = (await response.json()) as SpreadsheetData;

    if (!response.ok || data.error) {
      const msg = data.error?.message || `HTTP ${response.status}`;
      console.error("Google Sheets API error:", JSON.stringify(data.error || { status: response.status }, null, 2));
      return jsonResponse(500, {
        error: "Google Sheets API failed",
        details: msg,
        code: data.error?.code || response.status
      });
    }

    if (!data.sheets || data.sheets.length === 0) {
      throw new Error("No grid data found in spreadsheet (sheets array empty)");
    }

    const parsedUnits: any[] = [];
    const changelog: string[] = [];
    const notices: any[] = [];
    
    // --- FIREWALL VARIABLES ---
    const validationErrors: string[] = [];
    const seenIds = new Set<string>();
    const unitsPerTab: Record<string, number> = {};

    const sheetTitle = data.properties?.title || "ASTD Official Value List";
    const lastUpdated = new Date().toISOString();

    const tierTabs = ["S Tier", "A Tier", "B Tier", "C Tier", "Pure Tier", "Oddities", "Untiered"];

    for (const sheet of data.sheets) {
      const tabName = sheet.properties?.title || "Unknown";
      const rowData = sheet.data?.[0]?.rowData;
      
      if (tierTabs.includes(tabName)) unitsPerTab[tabName] = 0;
      if (!rowData) continue;

      // 1. HOME TAB (changelog)
      if (tabName === "Home") {
        let changelogColIdx = -1;
        rowData.forEach((row: RowData) => {
          if (!row.values) return;

          if (changelogColIdx === -1) {
            for (let j = 0; j < row.values.length; j++) {
              if ((row.values[j]?.formattedValue || "").includes("Latest Update Log")) {
                changelogColIdx = j;
                break;
              }
            }
          }

          if (changelogColIdx !== -1) {
            const text = row.values[changelogColIdx]?.formattedValue?.trim();
            if (text && !text.includes("Latest Update Log")) changelog.push(text);
          }
        });
        continue;
      }

      // 2. EXTRA NOTICES TAB
      if (tabName === "Extra Notices") {
        rowData.forEach((row: RowData, idx: number) => {
          if (idx < 3) return;
          const titleRaw = row.values?.[0]?.formattedValue?.trim() || "";
          const content = row.values?.[1]?.formattedValue?.trim() || "";
          if (titleRaw && content) {
            const match = titleRaw.match(/(.+?)(?:\s+(\d{1,2}\/\d{1,2}\/\d{2,4}))?$/);
            notices.push({
              title: match?.[1] || titleRaw,
              date: match?.[2] || null,
              content
            });
          }
        });
        continue;
      }

      // 3. TIER TABS
      let tierKey = "S";
      if (tabName.includes("A Tier")) tierKey = "A";
      else if (tabName.includes("B Tier")) tierKey = "B";
      else if (tabName.includes("C Tier")) tierKey = "C";
      else if (tabName.includes("Pure")) tierKey = "Pure";
      else if (tabName.includes("Oddities")) tierKey = "Oddities";
      else if (tabName.includes("Untiered")) tierKey = "Untiered";

      let currentSubCategory = tabName;
      let currentSubCategoryRange = "All";
      let colMap = { value: 2, rarity: 3, supply: 4, demand: 5, notices: 6, statusTxt: 7 };

      for (let i = 0; i < rowData.length; i++) {
        const row = rowData[i].values;
        if (!row) continue;

        const getCellStr = (idx: number) => row[idx]?.formattedValue?.toString().trim() || "";
        const colB = getCellStr(1);
        if (!colB) continue;

        const rawRowStrs = row.map((c) => c?.formattedValue?.toString().toLowerCase().trim() || "");
        const hasValue = rawRowStrs.some((s) => s.includes("value"));
        const hasNotices = rawRowStrs.some((s) => s.includes("notices"));

        // Detect Headers
        if (hasValue || (hasNotices && !colB.includes("/"))) {
          currentSubCategory = colB;
          colMap = { value: -1, rarity: -1, supply: -1, demand: -1, notices: -1, statusTxt: -1 };

          for (let j = 2; j < row.length; j++) {
            const headerText = rawRowStrs[j];
            if (headerText.includes("value")) {
              colMap.value = j;
              currentSubCategoryRange = headerText.replace(/value/i, "").replace(/\s+/g, " ").trim() || "Misc";
            } else if (headerText.includes("rarity")) colMap.rarity = j;
            else if (headerText.includes("supply")) colMap.supply = j;
            else if (headerText.includes("demand")) colMap.demand = j;
            else if (headerText.includes("notices")) {
              colMap.notices = j;
              colMap.statusTxt = j + 1;
            }
          }

          // Header structural validation (Untiered legitimately omits these)
          if (tierKey !== "Untiered") {
            if (colMap.value === -1) validationErrors.push(`[${tabName}, row ${i + 1}]: Category header detected, but 'Value' column is missing or misspelled.`);
            if (colMap.rarity === -1) validationErrors.push(`[${tabName}, row ${i + 1}]: Category header detected, but 'Rarity' column is missing or misspelled.`);
          }
          continue;
        }

        // Standard parsing: skip if blank value cell explicitly mapped
        if (!colB.includes("/") && colMap.value !== -1 && !getCellStr(colMap.value)) continue;

        let name = colB;
        let subtitle = "";
        if (colB.includes("/")) {
          const split = colB.split("/");
          name = split[0].trim();
          subtitle = split[1] ? split[1].trim() : "";
        } else if (colB.includes(" - ")) {
          const split = colB.split(" - ");
          name = split[0].trim();
          subtitle = split[1] ? split[1].trim() : "";
        }

        const rawValue = colMap.value !== -1 ? getCellStr(colMap.value).toLowerCase() : "";
        let numericValue: number | "owner" | "range" = 0;
        let valueMin: number | undefined = undefined;
        let valueDisplay: string | undefined = undefined;

        if (rawValue.includes("owner") || rawValue.includes("o/c")) {
          numericValue = "owner";
          valueDisplay = "Owner's Choice";
        } else if (rawValue.includes("-") || rawValue.includes("k") || rawValue.includes("m") || rawValue.includes("?")) {
          numericValue = "range";
          valueDisplay = rawValue ? getCellStr(colMap.value) : "0";
          const firstPart = rawValue.split("-")[0].replace("?", "0").trim();
          let multiplier = 1;
          if (firstPart.includes("k")) multiplier = 1000;
          if (firstPart.includes("m")) multiplier = 1000000;
          valueMin = (parseFloat(firstPart.replace(/[^0-9.]/g, "")) || 0) * multiplier;
        } else {
          // Intentional preservation: unparsable strings fallback to 0 safely.
          numericValue = parseInt(rawValue.replace(/[^0-9]/g, "")) || 0;
        }

        const nameColor = row[1]?.effectiveFormat?.backgroundColor;
        const valColor = colMap.value !== -1 ? row[colMap.value]?.effectiveFormat?.backgroundColor : undefined;
        
        let colorResult = getTagFromColor(nameColor);
        if (colorResult.tag === "stable" && !colorResult.error) {
          const fallback = getTagFromColor(valColor);
          if (fallback.tag !== "stable" || fallback.error) {
            colorResult = fallback;
          }
        }

        const rawStatusText = colMap.statusTxt !== -1
          ? getCellStr(colMap.statusTxt).toLowerCase().trim().replace(" ", "-")
          : "";
        
        let unitStatus = "stable";
        if (VALID_STATUSES.includes(rawStatusText)) {
          unitStatus = rawStatusText;
        } else if (colorResult.error) {
          unitStatus = "UNKNOWN_COLOR";
        } else {
          unitStatus = colorResult.tag;
        }

        // Preserve existing ID generation logic
        const unitId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        // Intentional preservation: missing optional stats safely fallback to 0.
        const rarityVal = colMap.rarity !== -1 ? parseFloat(getCellStr(colMap.rarity)) || 0 : 0;
        const supplyVal = colMap.supply !== -1 ? parseFloat(getCellStr(colMap.supply)) || 0 : 0;
        const demandVal = colMap.demand !== -1 ? parseFloat(getCellStr(colMap.demand)) || 0 : 0;

        // --- UNIT STRUCTURAL VALIDATION ---
        if (!name.trim()) validationErrors.push(`[${tabName}, row ${i + 1}]: Unit row parsed with an empty name.`);
        if (!unitId) validationErrors.push(`[${tabName}, row ${i + 1}]: Unit row "${name}" generated an empty ID.`);
        if (unitId && seenIds.has(unitId)) validationErrors.push(`[${tabName}, row ${i + 1}]: Duplicate ID "${unitId}" generated for unit "${name}".`);
        if (!VALID_TIERS.includes(tierKey)) validationErrors.push(`[${tabName}, row ${i + 1}]: Unrecognized tier "${tierKey}" mapped for unit "${name}".`);
        if (!VALID_STATUSES.includes(unitStatus)) validationErrors.push(`[${tabName}, row ${i + 1}]: Unknown status or unmapped background color for unit "${name}".`);
        
        // Strict Number Validations
        const isInvalidNumber = (val: any) => typeof val === "number" && !Number.isFinite(val);
        if (isInvalidNumber(numericValue)) validationErrors.push(`[${tabName}, row ${i + 1}]: Numeric value evaluated to NaN or Infinity for unit "${name}".`);
        if (isInvalidNumber(rarityVal)) validationErrors.push(`[${tabName}, row ${i + 1}]: Rarity evaluated to NaN or Infinity for unit "${name}".`);
        if (isInvalidNumber(supplyVal)) validationErrors.push(`[${tabName}, row ${i + 1}]: Supply evaluated to NaN or Infinity for unit "${name}".`);
        if (isInvalidNumber(demandVal)) validationErrors.push(`[${tabName}, row ${i + 1}]: Demand evaluated to NaN or Infinity for unit "${name}".`);

        if (unitId) seenIds.add(unitId);
        unitsPerTab[tabName]++;

        parsedUnits.push({
          id: unitId,
          name,
          subtitle,
          value: numericValue,
          valueMin,
          valueDisplay,
          rarity: rarityVal,
          supply: supplyVal,
          demand: demandVal,
          notice: colMap.notices !== -1 ? getCellStr(colMap.notices) : "",
          status: unitStatus,
          tier: tierKey,
          subCategory: currentSubCategory,
          subCategoryRange: currentSubCategoryRange
        });
      }
    }

    // Secondary Check: Empty Tabs
    for (const [tab, count] of Object.entries(unitsPerTab)) {
      if (count === 0) {
        validationErrors.push(`[${tab}]: Sheet parsed 0 valid units. Structural corruption likely.`);
      }
    }

    // --- HALT AND CATCH FIRE IF VALIDATION FAILS ---
    if (validationErrors.length > 0) {
      console.error("Spreadsheet Validation Failed. Blocking Corrupt Output. Details:", JSON.stringify(validationErrors, null, 2));
      return jsonResponse(500, {
        error: "Spreadsheet structure is currently malformed or invalid. The frontend will safely fall back to its local cache.",
        details: validationErrors
      });
    }

    return jsonResponse(
      200,
      { units: parsedUnits, changelog, notices, sheetTitle, lastUpdated },
      { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    );
  } catch (error: any) {
    console.error("syncSheet error:", error);
    return jsonResponse(500, {
      error: "Failed to sync sheet data.",
      details: error?.message || String(error)
    });
  }
};