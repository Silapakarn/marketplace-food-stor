import { Decimal } from '@prisma/client/runtime/library';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class Order {
  constructor(
    public readonly id: number,
    public readonly memberCardNumber: string | null,
    public readonly totalBeforeDiscount: Decimal,
    public readonly pairDiscount: Decimal,
    public readonly memberDiscount: Decimal,
    public readonly finalTotal: Decimal,
    public readonly createdAt: Date,
    public readonly items: OrderItem[],
  ) {}

  getTotalBeforeDiscountAsNumber(): number {
    return Math.round(this.totalBeforeDiscount.toNumber() * 100) / 100;
  }

  getPairDiscountAsNumber(): number {
    return Math.round(this.pairDiscount.toNumber() * 100) / 100;
  }

  getMemberDiscountAsNumber(): number {
    return Math.round(this.memberDiscount.toNumber() * 100) / 100;
  }

  getFinalTotalAsNumber(): number {
    return Math.round(this.finalTotal.toNumber() * 100) / 100;
  }

  hasMemberCard(): boolean {
    return this.memberCardNumber !== null && this.memberCardNumber.length > 0;
  }

  static create(data: {
    id: number;
    memberCardNumber: string | null;
    totalBeforeDiscount: Decimal;
    pairDiscount: Decimal;
    memberDiscount: Decimal;
    finalTotal: Decimal;
    createdAt: Date;
    items: OrderItem[];
  }): Order {
    return new Order(
      data.id,
      data.memberCardNumber,
      data.totalBeforeDiscount,
      data.pairDiscount,
      data.memberDiscount,
      data.finalTotal,
      data.createdAt,
      data.items,
    );
  }
}
