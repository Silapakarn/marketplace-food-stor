export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  memberCardNumber?: string;
}

export interface OrderCalculation {
  totalBeforeDiscount: number;
  pairDiscount: number;
  memberDiscount: number;
  finalTotal: number;
  itemsWithPairDiscount: Array<{
    productName: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    pairBreakdown?: {
      pairs: number;
      remaining: number;
      pricePerPair: number;
      discountPerPair: number;
      totalPairDiscount: number;
    };
  }>;
  breakdown: {
    subtotal: number;
    afterPairDiscount: number;
    afterMemberDiscount: number;
  };
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
  calculation: OrderCalculation;
}