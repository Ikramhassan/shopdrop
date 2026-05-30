import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  skuId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  priceAliexpress: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, skuId?: string) => void;
  updateQty: (productId: string, skuId: string | undefined, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.skuId === item.skuId
        );
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.productId === item.productId && i.skuId === item.skuId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },
      removeItem: (productId, skuId) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && i.skuId === skuId)
          ),
        })),
      updateQty: (productId, skuId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, skuId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.skuId === skuId
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "shopdrop-cart" }
  )
);
