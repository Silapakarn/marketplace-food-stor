import { CartItem } from '../types';
import { Product } from '../../product/types';

class CartService {
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  calculateTotalItems(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  findItemById(items: CartItem[], productId: number): CartItem | undefined {
    return items.find(item => item.product.id === productId);
  }

  addItem(items: CartItem[], product: Product, quantity: number = 1): CartItem[] {
    const existingItem = this.findItemById(items, product.id);
    
    if (existingItem) {
      return items.map((item: CartItem) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }
    
    return [...items, { product, quantity }];
  }

  removeItem(items: CartItem[], productId: number): CartItem[] {
    return items.filter(item => item.product.id !== productId);
  }

  updateQuantity(items: CartItem[], productId: number, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(items, productId);
    }
    
    return items.map((item: CartItem) =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );
  }
}

export const cartService = new CartService();