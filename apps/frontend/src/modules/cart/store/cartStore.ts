/**
 * Application Layer - Cart State Management
 * Manages shopping cart state and operations
 */
 

import { create } from 'zustand';
import { Product } from '../../product/types/product';
import { CartItem } from '../types/cart';

interface CartStore {
  items: CartItem[];
  memberCardNumber: string;
  
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setMemberCardNumber: (cardNumber: string) => void;
  clearCart: () => void;
  
  // Selectors
  getTotalItems: () => number;
  getItemQuantity: (productId: number) => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  memberCardNumber: '',

  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId: number) => {
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === productId);

    if (existingItem && existingItem.quantity > 1) {
      set({
        items: items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      });
    } else {
      set({ items: items.filter((item) => item.product.id !== productId) });
    }
  },

  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((item) => item.product.id !== productId) });
    } else {
      set({
        items: get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      });
    }
  },

  setMemberCardNumber: (cardNumber: string) => {
    set({ memberCardNumber: cardNumber });
  },

  clearCart: () => {
    set({ items: [], memberCardNumber: '' });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getItemQuantity: (productId: number) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));
