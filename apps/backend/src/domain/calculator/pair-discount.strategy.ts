import { IDiscountStrategy, OrderItemInput, DiscountResult } from './discount-strategy.interface';

export class PairDiscountStrategy implements IDiscountStrategy {
  private readonly PAIR_DISCOUNT_RATE = 0.05;

  calculate(items: OrderItemInput[]): DiscountResult {
    const itemsWithDiscount: DiscountResult['itemsWithDiscount'] = [];
    let totalDiscount = 0;

    for (const item of items) {
      const itemResult = item.product.canHavePairDiscount()
        ? this.calculatePairDiscountForItem(item)
        : this.calculateNoDiscount(item);

      itemsWithDiscount.push(itemResult);
      totalDiscount += itemResult.discountAmount;
    }

    return {
      itemsWithDiscount,
      totalDiscount: this.roundToTwo(totalDiscount),
    };
  }

  private calculatePairDiscountForItem(item: OrderItemInput) {
    const pairs = Math.floor(item.quantity / 2);
    const unitPrice = item.product.getPriceAsNumber();

    if (pairs === 0) {
      return this.calculateNoDiscount(item);
    }

    const remaining = item.quantity % 2;
    
    const pairPrice = unitPrice * 2;
    const discountPerPair = pairPrice * this.PAIR_DISCOUNT_RATE;
    const totalPairDiscount = discountPerPair * pairs;
    const priceAfterPairDiscount = (pairPrice - discountPerPair) * pairs;
    const remainingPrice = remaining * unitPrice;
    
    const totalOriginalPrice = pairPrice * pairs + remainingPrice;
    const totalFinalPrice = priceAfterPairDiscount + remainingPrice;

    return {
      productName: item.product.name,
      originalPrice: this.roundToTwo(totalOriginalPrice),
      discountAmount: this.roundToTwo(totalPairDiscount),
      finalPrice: this.roundToTwo(totalFinalPrice),
    };
  }

  private calculateNoDiscount(item: OrderItemInput) {
    const totalPrice = item.product.getPriceAsNumber() * item.quantity;
    
    return {
      productName: item.product.name,
      originalPrice: this.roundToTwo(totalPrice),
      discountAmount: 0,
      finalPrice: this.roundToTwo(totalPrice),
    };
  }

  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
