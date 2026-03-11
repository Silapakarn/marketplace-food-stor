import { IDiscountStrategy, OrderItemInput, DiscountResult } from './discount-strategy.interface';


/**
 * Domain Service: Member Discount Strategy
 * Business Rule: Member card holders get 10% discount on total
 */
export class MemberDiscountStrategy implements IDiscountStrategy {
  private readonly MEMBER_DISCOUNT_RATE = 0.10;

  calculate(items: OrderItemInput[]): DiscountResult {
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.product.getPriceAsNumber() * item.quantity);
    }, 0);

    const discount = totalPrice * this.MEMBER_DISCOUNT_RATE;

    return {
      itemsWithDiscount: [{
        productName: 'Member Card Discount',
        originalPrice: totalPrice,
        discountAmount: discount,
        finalPrice: totalPrice - discount,
      }],
      totalDiscount: discount,
    };
  }
}
