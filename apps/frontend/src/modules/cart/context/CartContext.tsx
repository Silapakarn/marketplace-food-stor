'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { CartItem } from '../types';
import { Product } from '../../product/types';
import { cartService } from '../services';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalItems = useMemo(() => cartService.calculateTotalItems(items), [items]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prevItems) => cartService.addItem(prevItems, product, quantity));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prevItems) => cartService.removeItem(prevItems, productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prevItems) => cartService.updateQuantity(prevItems, productId, quantity));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: number) => {
    const item = cartService.findItemById(items, productId);
    return item?.quantity || 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, totalItems, addItem, removeItem, updateQuantity, clearCart, getItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
