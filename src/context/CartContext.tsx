import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, SelectedOption } from '../types';

interface CartContextType {
  getCart: (restaurantId: string) => CartItem[];
  addToCart: (
    restaurantId: string,
    menuItem: { id: string; name: string; price: number; imageUrl?: string; category?: string },
    quantity?: number,
    selectedOptions?: SelectedOption[],
    specialInstructions?: string
  ) => void;
  updateQuantity: (restaurantId: string, cartItemId: string, delta: number) => void;
  removeFromCart: (restaurantId: string, cartItemId: string) => void;
  clearCart: (restaurantId: string) => void;
  getSubtotal: (restaurantId: string) => number;
  getItemCount: (restaurantId: string) => number;
}

const STORAGE_KEY = 'dinecraft_cart_v2';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carts, setCarts] = useState<Record<string, CartItem[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
    } catch (e) {
      console.warn('Cart localStorage save error:', e);
    }
  }, [carts]);

  const getCart = (restaurantId: string): CartItem[] => {
    return carts[restaurantId] || [];
  };

  const addToCart = (
    restaurantId: string,
    menuItem: { id: string; name: string; price: number; imageUrl?: string; category?: string },
    quantity = 1,
    selectedOptions: SelectedOption[] = [],
    specialInstructions = ''
  ) => {
    setCarts((prev) => {
      const current = prev[restaurantId] || [];
      // Calculate unit price with options
      const optionsDelta = selectedOptions.reduce((acc, opt) => acc + opt.priceDelta, 0);
      const unitPrice = menuItem.price + optionsDelta;

      // Unique line id based on options
      const optionsKey = selectedOptions.map((o) => `${o.groupName}:${o.optionName}`).sort().join('|');
      const cartItemId = `${menuItem.id}_${optionsKey}_${specialInstructions.trim()}`;

      const existingIndex = current.findIndex((ci) => ci.id === cartItemId);

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = current.map((ci, idx) =>
          idx === existingIndex ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          menuItemId: menuItem.id,
          restaurantId,
          name: menuItem.name,
          price: unitPrice,
          quantity,
          imageUrl: menuItem.imageUrl,
          category: menuItem.category,
          selectedOptions,
          specialInstructions: specialInstructions.trim() || undefined,
        };
        updated = [...current, newItem];
      }
      return { ...prev, [restaurantId]: updated };
    });
  };

  const updateQuantity = (restaurantId: string, cartItemId: string, delta: number) => {
    setCarts((prev) => {
      const current = prev[restaurantId] || [];
      const updated = current
        .map((ci) => {
          if (ci.id === cartItemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
      return { ...prev, [restaurantId]: updated };
    });
  };

  const removeFromCart = (restaurantId: string, cartItemId: string) => {
    setCarts((prev) => ({
      ...prev,
      [restaurantId]: (prev[restaurantId] || []).filter((ci) => ci.id !== cartItemId),
    }));
  };

  const clearCart = (restaurantId: string) => {
    setCarts((prev) => ({
      ...prev,
      [restaurantId]: [],
    }));
  };

  const getSubtotal = (restaurantId: string): number => {
    const current = carts[restaurantId] || [];
    return current.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = (restaurantId: string): number => {
    const current = carts[restaurantId] || [];
    return current.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        getCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
