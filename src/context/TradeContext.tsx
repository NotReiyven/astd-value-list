import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { TradeCard, PopupUnit } from '../types';

type TradeContextType = {
  giveItems: TradeCard[];
  getItems: TradeCard[];
  addGive: (unit: PopupUnit) => void;
  addGet: (unit: PopupUnit) => void;
  changeQty: (col: "give" | "get", id: string, qty: number) => void;
  removeCard: (col: "give" | "get", id: string) => void;
  clearSection: (col: "give" | "get") => void;
  overwrite: (giveCards: TradeCard[], getCards: TradeCard[]) => void;
  swap: () => void;
};

const TradeContext = createContext<TradeContextType | null>(null);

// Same shape check used in App.tsx's useStickyState -- confirms the parsed
// JSON is actually an array of objects with the fields the rest of this
// file (and the UnitGrid/TradeAnalyzer components) assume exist before
// handing it to useState. Prevents a corrupted/hand-edited localStorage
// value from crashing the app the first time something calls .map()/.find()
// on giveItems or getItems.
const isTradeCardArray = (value: unknown): value is TradeCard[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as any).id === "string" &&
      typeof (item as any).qty === "number"
  );

function loadStickyTradeCards(key: string): TradeCard[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (isTradeCardArray(parsed)) return parsed;
      console.warn(`Ignoring malformed localStorage value for "${key}"`, parsed);
    }
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
  }
  return [];
}

export const TradeProvider = ({ children }: { children: React.ReactNode }) => {
  const [giveItems, setGiveItems] = useState<TradeCard[]>(() => loadStickyTradeCards("astd_trade_give"));

  const [getItems, setGetItems] = useState<TradeCard[]>(() => loadStickyTradeCards("astd_trade_get"));

  useEffect(() => {
    localStorage.setItem("astd_trade_give", JSON.stringify(giveItems));
    localStorage.setItem("astd_trade_get", JSON.stringify(getItems));
  }, [giveItems, getItems]);

  const addGive = useCallback((unit: PopupUnit) => {
    setGiveItems((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    toast.success(`Added ${unit.name}`, { description: "Added to You Give", icon: <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#FAA61A]"><Check className="w-3.5 h-3.5 text-white" /></div> });
  }, []);

  const addGet = useCallback((unit: PopupUnit) => {
    setGetItems((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    toast.success(`Added ${unit.name}`, { description: "Added to You Get", icon: <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#5865F2]"><Check className="w-3.5 h-3.5 text-white" /></div> });
  }, []);

  const changeQty = useCallback((col: "give" | "get", id: string, qty: number) => {
    const setter = col === "give" ? setGiveItems : setGetItems;
    setter((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  }, []);

  const removeCard = useCallback((col: "give" | "get", id: string) => {
    const setter = col === "give" ? setGiveItems : setGetItems;
    setter((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearSection = useCallback((col: "give" | "get") => {
    if (col === "give") setGiveItems([]);
    else setGetItems([]);
  }, []);

  const overwrite = useCallback((giveCards: TradeCard[], getCards: TradeCard[]) => {
    setGiveItems(giveCards);
    setGetItems(getCards);
  }, []);

  const swap = useCallback(() => {
    setGiveItems([...getItems]);
    setGetItems([...giveItems]);
  }, [giveItems, getItems]);

  return (
    <TradeContext.Provider value={{ giveItems, getItems, addGive, addGet, changeQty, removeCard, clearSection, overwrite, swap }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrade must be used within a TradeProvider");
  return context;
};