import { IDiscountStrategy, OrderItemInput, DiscountResult } from './discount-strategy.interface';

/**
 * Domain Service: Member Discount Strategy
 * Business Rule: Member card holders get 10% discount on total
 */
export class MemberDiscountStrategy implements IDiscountStrategy {
  private readonly MEMBER_DISCOUNT_RATE = 0.10;

  calculate(items: OrderItemInput[]): DiscountResult {
    // Single pass calculation - O(n)
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.product.getPriceAsNumber() * item.quantity;
    }

    const discount = this.roundToTwo(totalPrice * this.MEMBER_DISCOUNT_RATE);

    return {
      itemsWithDiscount: [{
        productName: 'Member Card Discount',
        originalPrice: this.roundToTwo(totalPrice),
        discountAmount: discount,
        finalPrice: this.roundToTwo(totalPrice - discount),
      }],
      totalDiscount: discount,
    };
  }

  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
