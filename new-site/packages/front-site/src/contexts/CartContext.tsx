import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
  isBabydoll?: boolean;
  comboDateTimes?: string[];
}

export interface AddToCartParams {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "KIT" | "COFFEE" | "COMBO" | "OTHER";
  size?: string;
  dateTime?: string;
  isBabydoll?: boolean;
  comboDateTimes?: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: AddToCartParams) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((params: AddToCartParams) => {
    const cartKey = `${params.id}_${params.size ?? ""}_${params.dateTime ?? ""}_${params.isBabydoll ?? ""}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i,
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
          const newQty = i.quantity + delta;
          return { ...i, quantity: Math.max(0, newQty) };
        })
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems }}
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
