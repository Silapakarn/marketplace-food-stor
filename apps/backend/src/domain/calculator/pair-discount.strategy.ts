import { PAIR_DISCOUNT_RATE } from '../../shared/constants/calculator';
import { IDiscountStrategy, OrderItemInput, DiscountResult } from './discount-strategy.interface';
import { roundToTwo } from '../../shared/utils/format';

export class PairDiscountStrategy implements IDiscountStrategy {

  // O(n) — single pass over items
  calculate(items: OrderItemInput[]): DiscountResult {
    let totalDiscount = 0;
    const itemsWithDiscount = items.map(item => {
      const result = item.product.canHavePairDiscount()
        ? this.calculatePairDiscount(item)
        : this.calculateNoDiscount(item);
      totalDiscount += result.discountAmount;
      return result;
    });

    return { itemsWithDiscount, totalDiscount: roundToTwo(totalDiscount) };
  }

  private calculatePairDiscount(item: OrderItemInput): DiscountResult['itemsWithDiscount'][number] {
    const pairs = Math.floor(item.quantity / 2);
    const unitPrice = item.product.getPriceAsNumber();

    if (pairs === 0) {
      return this.calculateNoDiscount(item);
    }

    const remaining = item.quantity % 2;
    const pairPrice = unitPrice * 2;
    const discountPerPair = roundToTwo(pairPrice * PAIR_DISCOUNT_RATE);
    const totalPairDiscount = roundToTwo(discountPerPair * pairs);
    const originalPrice = roundToTwo(pairPrice * pairs + remaining * unitPrice);
    const finalPrice = roundToTwo(originalPrice - totalPairDiscount);

    return {
      productName: item.product.name,
      originalPrice,
      discountAmount: totalPairDiscount,
      finalPrice,
      pairBreakdown: {
        pairs,
        remaining,
        pricePerPair: roundToTwo(pairPrice),
        discountPerPair,
        totalPairDiscount,
      },
    };
  }

  private calculateNoDiscount(item: OrderItemInput): DiscountResult['itemsWithDiscount'][number] {
    const totalPrice = roundToTwo(item.product.getPriceAsNumber() * item.quantity);
    return {
      productName: item.product.name,
      originalPrice: totalPrice,
      discountAmount: 0,
      finalPrice: totalPrice,
    };
  }
}
