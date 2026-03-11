/**
 * Application Layer - Cart Hooks
 * Business logic for cart operations
 */
 

import { useCartStore } from '../store/cartStore';
import { Product } from '../../product/types/product';

export const useCart = () => {
  const {
    items,
    memberCardNumber,
    addItem,
    removeItem,
    updateQuantity,
    setMemberCardNumber,
    clearCart,
    getTotalItems,
    getItemQuantity,
  } = useCartStore();

  return {
    // State
    items,
    memberCardNumber,
    totalItems: getTotalItems(),
    
    // Actions
    addItem: (product: Product) => addItem(product),
    removeItem: (productId: number) => removeItem(productId),
    updateQuantity: (productId: number, quantity: number) => updateQuantity(productId, quantity),
    setMemberCardNumber: (cardNumber: string) => setMemberCardNumber(cardNumber),
    clearCart: () => clearCart(),
    
    // Selectors
    getQuantity: (productId: number) => getItemQuantity(productId),
  };
};
