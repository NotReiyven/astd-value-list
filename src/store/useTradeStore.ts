import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TradeCard } from '../types';

interface TradeState {
  giveItems: TradeCard[];
  getItems: TradeCard[];
  pinnedIds: string[]; // Stored as array for JSON serialization
  addCard: (col: "give" | "get", card: TradeCard) => void;
  changeQty: (col: "give" | "get", id: string, qty: number) => void;
  removeCard: (col: "give" | "get", id: string) => void;
  clearSection: (col: "give" | "get") => void;
  clearAllUnpinned: () => { give: TradeCard[], get: TradeCard[] }; // Returns previous state for undo
  swap: () => void;
  overwrite: (giveCards: TradeCard[], getCards: TradeCard[]) => void;
  togglePin: (col: "give" | "get", id: string) => void;
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      giveItems: [],
      getItems: [],
      pinnedIds: [],

      addCard: (col, card) => set((state) => {
        const target = col === "give" ? state.giveItems : state.getItems;
        const existing = target.find(c => c.id === card.id);
        const newTarget = existing 
          ? target.map(c => c.id === card.id ? { ...c, qty: c.qty + 1 } : c)
          : [...target, { ...card, qty: 1 }];
        return col === "give" ? { giveItems: newTarget } : { getItems: newTarget };
      }),

      changeQty: (col, id, qty) => set((state) => {
        const target = col === "give" ? state.giveItems : state.getItems;
        const newTarget = target.map(c => c.id === id ? { ...c, qty } : c);
        return col === "give" ? { giveItems: newTarget } : { getItems: newTarget };
      }),

      removeCard: (col, id) => set((state) => {
        const target = col === "give" ? state.giveItems : state.getItems;
        const newTarget = target.filter(c => c.id !== id);
        return col === "give" ? { giveItems: newTarget } : { getItems: newTarget };
      }),

      clearSection: (col) => set((state) => {
        const target = col === "give" ? state.giveItems : state.getItems;
        const newTarget = target.filter(c => state.pinnedIds.includes(`${col}-${c.id}`));
        return col === "give" ? { giveItems: newTarget } : { getItems: newTarget };
      }),

      clearAllUnpinned: () => {
        const state = get();
        const previousState = { give: [...state.giveItems], get: [...state.getItems] };
        set({
          giveItems: state.giveItems.filter(c => state.pinnedIds.includes(`give-${c.id}`)),
          getItems: state.getItems.filter(c => state.pinnedIds.includes(`get-${c.id}`))
        });
        return previousState;
      },

      swap: () => set((state) => ({
        giveItems: [...state.getItems],
        getItems: [...state.giveItems]
      })),

      overwrite: (giveCards, getCards) => set({
        giveItems: giveCards,
        getItems: getCards
      }),

      togglePin: (col, id) => set((state) => {
        const pinKey = `${col}-${id}`;
        const isPinned = state.pinnedIds.includes(pinKey);
        return {
          pinnedIds: isPinned 
            ? state.pinnedIds.filter(p => p !== pinKey)
            : [...state.pinnedIds, pinKey]
        };
      })
    }),
    {
      name: 'astd_trade_storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Fallback mechanism to clear out corrupted older states safely
          persistedState.giveItems = Array.isArray(persistedState.giveItems) ? persistedState.giveItems : [];
          persistedState.getItems = Array.isArray(persistedState.getItems) ? persistedState.getItems : [];
          persistedState.pinnedIds = Array.isArray(persistedState.pinnedIds) ? persistedState.pinnedIds : [];
        }
        return persistedState as TradeState;
      },
    }
  )
);