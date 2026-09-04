import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

function getCoffeeDateTimes(item: { type: string; dateTime?: string; comboDateTimes?: string[] }): Set<string> {
  if (item.type === "COFFEE" && item.dateTime) return new Set([item.dateTime]);
  if (item.type === "COMBO" && item.comboDateTimes?.length) return new Set(item.comboDateTimes);
  return new Set();
}

// ─── Tipos ────────────────────────────────────────────────
export interface CartItem {
  id: string;
  cartKey: string;
  type: "KIT" | "COFFEE" | "COMBO" | "OTHER";
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  dateTime?: string;
  isBabylook?: boolean;
  comboDateTimes?: string[];
  kitProductId?: string;
}

export interface AddToCartParams {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "KIT" | "COFFEE" | "COMBO" | "OTHER";
  size?: string;
  dateTime?: string;
  isBabylook?: boolean;
  comboDateTimes?: string[];
  kitProductId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: AddToCartParams) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  /** Retorna o item do carrinho que compartilha um coffee-dateTime com `params`, ou null se não houver conflito. */
  getConflict: (params: AddToCartParams) => CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Coffee e Combo são compra única: nunca passam de 1 unidade por horário.
  const maxQuantity = (type: CartItem["type"]): number =>
    type === "COFFEE" || type === "COMBO" ? 1 : Number.POSITIVE_INFINITY;

  const addItem = useCallback((params: AddToCartParams) => {
    const cartKey = `${params.id}_${params.size ?? ""}_${params.dateTime ?? ""}_${params.isBabylook ?? ""}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey
            ? { ...i, quantity: Math.min(i.quantity + 1, maxQuantity(i.type)) }
            : i,
        );
      }
      return [...prev, { ...params, cartKey, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.cartKey !== cartKey) return i;
          const newQty = Math.min(i.quantity + delta, maxQuantity(i.type));
          return { ...i, quantity: Math.max(0, newQty) };
        })
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getConflict = useCallback((params: AddToCartParams): CartItem | null => {
    const newDTs = getCoffeeDateTimes(params);
    if (newDTs.size === 0) return null;
    const cartKey = `${params.id}_${params.size ?? ""}_${params.dateTime ?? ""}_${params.isBabylook ?? ""}`;
    for (const item of items) {
      if (item.cartKey === cartKey) continue;
      const existingDTs = getCoffeeDateTimes(item);
      if ([...newDTs].some((dt) => existingDTs.has(dt))) return item;
    }
    return null;
  }, [items]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems, getConflict }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
