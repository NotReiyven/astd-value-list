import { Handler } from "@netlify/functions";

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

function getTagFromColor(colorObj: any) {
  if (!colorObj) return "stable";
  const r = Math.round((colorObj.red || 0) * 255);
  const g = Math.round((colorObj.green || 0) * 255);
  const b = Math.round((colorObj.blue || 0) * 255);
  let bestTag = "stable", minDistance = Infinity;

  for (const target of COLOR_TARGETS) {
    const distance = Math.sqrt(Math.pow(r - target.r, 2) + Math.pow(g - target.g, 2) + Math.pow(b - target.b, 2));
    if (distance < minDistance) { minDistance = distance; bestTag = target.tag; }
  }
  return minDistance < 100 ? bestTag : "stable";
}

export const handler: Handler = async (event, context) => {
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const SHEET_ID = process.env.SPREADSHEET_ID;
  
  // Scrape all core sheets to build the live payload
  const ranges = [
    "S Tier!A:H", "A Tier!A:H", "B Tier!A:H", "C Tier!A:H", 
    "Pure Tier!A:H", "Oddities!A:H", "Untiered!A:H", 
    "Home!A:K", "Extra Notices!A:B"
  ];
  const batchRanges = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join("&");

  if (!API_KEY || !SHEET_ID) return { statusCode: 500, body: JSON.stringify({ error: "Missing Environment Variables" }) };

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?${batchRanges}&includeGridData=true&key=${API_KEY}`);
    const data = await response.json();

    if (!data.sheets) throw new Error("No grid data found in spreadsheet");

    const parsedUnits: any[] = [];
    const changelog: string[] = [];
    const notices: any[] = [];
    
    const sheetTitle = data.properties?.title || "ASTD Official Value List";
    const lastUpdated = new Date().toISOString();

    for (const sheet of data.sheets) {
      const tabName = sheet.properties?.title || "Unknown";
      const rowData = sheet.data?.[0]?.rowData;
      if (!rowData) continue;

      // ========================================================
      // 1. SCRAPE HOME TAB (Patch Notes)
      // ========================================================
      if (tabName === "Home") {
        let changelogColIdx = -1;
        rowData.forEach((row: any) => {
          if (!row.values) return;
          
          if (changelogColIdx === -1) {
            for (let j = 0; j < row.values.length; j++) {
              if ((row.values[j]?.formattedValue || "").includes("Latest Update Log")) {
                changelogColIdx = j; break;
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

      // ========================================================
      // 2. SCRAPE EXTRA NOTICES TAB
      // ========================================================
      if (tabName === "Extra Notices") {
        rowData.forEach((row: any, idx: number) => {
          if (idx < 3) return; // Skip title headers
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

      // ========================================================
      // 3. DYNAMIC TIER PARSING (Handles Missing Columns)
      // ========================================================
      let tierKey = "S";
      if (tabName.includes("A Tier")) tierKey = "A";
      else if (tabName.includes("B Tier")) tierKey = "B";
      else if (tabName.includes("C Tier")) tierKey = "C";
      else if (tabName.includes("Pure")) tierKey = "Pure";
      else if (tabName.includes("Oddities")) tierKey = "Oddities";
      else if (tabName.includes("Untiered")) tierKey = "Untiered";

      let currentSubCategory = tabName, currentSubCategoryRange = "All";
      
      // Default fallback mapping
      let colMap = { value: 2, rarity: 3, supply: 4, demand: 5, notices: 6, statusTxt: 7 };

      for (let i = 0; i < rowData.length; i++) {
        const row = rowData[i].values;
        if (!row) continue;

        const getCellStr = (idx: number) => row[idx]?.formattedValue?.toString().trim() || "";
        const colB = getCellStr(1);
        if (!colB) continue;

        const rawRowStrs = row.map((c: any) => c?.formattedValue?.toString().toLowerCase().trim() || "");
        const hasValue = rawRowStrs.some((s: string) => s.includes("value"));
        const hasNotices = rawRowStrs.some((s: string) => s.includes("notices"));

        // If row is a subcategory header, remap the column indexes dynamically!
        if (hasValue || (hasNotices && !colB.includes("/"))) {
          currentSubCategory = colB;
          colMap = { value: -1, rarity: -1, supply: -1, demand: -1, notices: -1, statusTxt: -1 };
          
          for(let j=2; j < row.length; j++) {
            const headerText = rawRowStrs[j];
            if(headerText.includes("value")) {
                colMap.value = j;
                currentSubCategoryRange = headerText.replace(/value/i, "").replace(/\s+/g, " ").trim() || "Misc";
            }
            else if(headerText.includes("rarity")) colMap.rarity = j;
            else if(headerText.includes("supply")) colMap.supply = j;
            else if(headerText.includes("demand")) colMap.demand = j;
            else if(headerText.includes("notices")) {
                colMap.notices = j;
                colMap.statusTxt = j + 1; // Explicit text status is usually right after notices
            }
          }
          continue;
        }

        // Skip random spreadsheet notes
        if (!colB.includes("/") && colMap.value !== -1 && !getCellStr(colMap.value)) continue; 

        // Split unit name and subtitle
        let name = colB, subtitle = "";
        if (colB.includes("/")) {
          const split = colB.split("/");
          name = split[0].trim(); subtitle = split[1] ? split[1].trim() : "";
        } else if (colB.includes(" - ")) {
          const split = colB.split(" - ");
          name = split[0].trim(); subtitle = split[1] ? split[1].trim() : "";
        }

        // Parse numerical values & ranges
        const rawValue = colMap.value !== -1 ? getCellStr(colMap.value).toLowerCase() : "";
        let numericValue: number | "owner" | "range" = 0, valueMin: number | undefined = undefined, valueDisplay: string | undefined = undefined;

        if (rawValue.includes("owner") || rawValue.includes("o/c")) {
          numericValue = "owner"; valueDisplay = "Owner's Choice";
        } else if (rawValue.includes("-") || rawValue.includes("k") || rawValue.includes("m") || rawValue.includes("?")) {
          numericValue = "range"; 
          valueDisplay = rawValue ? getCellStr(colMap.value) : "0";
          const firstPart = rawValue.split("-")[0].replace("?", "0").trim();
          let multiplier = 1;
          if (firstPart.includes("k")) multiplier = 1000;
          if (firstPart.includes("m")) multiplier = 1000000;
          valueMin = (parseFloat(firstPart.replace(/[^0-9.]/g, "")) || 0) * multiplier;
        } else {
          numericValue = parseInt(rawValue.replace(/[^0-9]/g, "")) || 0;
        }

        // Determine Status Color
        const nameColor = row[1]?.effectiveFormat?.backgroundColor;
        const valColor = colMap.value !== -1 ? row[colMap.value]?.effectiveFormat?.backgroundColor : null;
        let parsedTag = getTagFromColor(nameColor);
        if (parsedTag === "stable") parsedTag = getTagFromColor(valColor);

        // Allow explicitly written statuses to override background colors
        const rawStatusText = colMap.statusTxt !== -1 ? getCellStr(colMap.statusTxt).toLowerCase().trim().replace(" ", "-") : "";
        const validStatuses = ["stable", "unstable", "rising", "dropping", "inflated", "deflated", "varies", "maximum", "hyped", "gatekept", "black-marketed"];
        const unitStatus = validStatuses.includes(rawStatusText) ? rawStatusText : parsedTag;

        parsedUnits.push({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), 
          name, subtitle, value: numericValue, valueMin, valueDisplay,
          rarity: colMap.rarity !== -1 ? parseFloat(getCellStr(colMap.rarity)) || 0 : 0, 
          supply: colMap.supply !== -1 ? parseFloat(getCellStr(colMap.supply)) || 0 : 0, 
          demand: colMap.demand !== -1 ? parseFloat(getCellStr(colMap.demand)) || 0 : 0,
          notice: colMap.notices !== -1 ? getCellStr(colMap.notices) : "", 
          status: unitStatus, tier: tierKey, subCategory: currentSubCategory, subCategoryRange: currentSubCategoryRange
        });
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ units: parsedUnits, changelog, notices, sheetTitle, lastUpdated })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: String(error) }) };
  }
};