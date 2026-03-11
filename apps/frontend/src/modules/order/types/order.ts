/**
 * Domain Layer - Order Types
 * Core business entities for orders
 */

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface DiscountDetail {
  productName: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}


export interface CalculationResult {
  totalBeforeDiscount: number;
  pairDiscount: number;
  memberDiscount: number;
  finalTotal: number;
  itemsWithPairDiscount: DiscountDetail[];
  breakdown: {
    subtotal: number;
    afterPairDiscount: number;
    afterMemberDiscount: number;
  };
}

export interface CreateOrderRequest {
  items: OrderItem[];
  memberCardNumber?: string;
}

export interface OrderResponse {
  id: number;
  memberCardNumber: string | null;
  totalBeforeDiscount: number;
  pairDiscount: number;
  memberDiscount: number;
  finalTotal: number;
  createdAt: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  calculation: CalculationResult;
}
