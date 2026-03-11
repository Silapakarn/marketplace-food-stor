export class OrderResponseDto {
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
  calculation: {
    totalBeforeDiscount: number;
    pairDiscount: number;
    memberDiscount: number;
    finalTotal: number;
    itemsWithPairDiscount: Array<{
      productName: string;
      originalPrice: number;
      discountAmount: number;
      finalPrice: number;
    }>;
    breakdown: {
      subtotal: number;
      afterPairDiscount: number;
      afterMemberDiscount: number;
    };
  };
}
