/**
 * Domain Layer - Cart Types
 * Core business entities for shopping cart
 */

import { Product } from '../../product/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  memberCardNumber: string;
}
