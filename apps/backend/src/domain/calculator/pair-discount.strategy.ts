import { IDiscountStrategy, OrderItemInput, DiscountResult } from './discount-strategy.interface';


/**
 * Domain Service: Pair Discount Strategy
 * Business Rule: Orange, Pink, and Green sets get 5% discount per pair
 */
export class PairDiscountStrategy implements IDiscountStrategy {
  private readonly PAIR_DISCOUNT_RATE = 0.05;

  calculate(items: OrderItemInput[]): DiscountResult {
    const itemsWithDiscount: DiscountResult['itemsWithDiscount'] = [];
    let totalDiscount = 0;

    for (const item of items) {
      if (item.product.canHavePairDiscount()) {
        const pairs = Math.floor(item.quantity / 2);
        const remaining = item.quantity % 2;

        if (pairs > 0) {
          // Calculate discount for pairs
          const pairPrice = item.product.getPriceAsNumber() * 2;
          const discountPerPair = pairPrice * this.PAIR_DISCOUNT_RATE;
          const totalPairDiscount = discountPerPair * pairs;

          itemsWithDiscount.push({
            productName: item.product.name,
            originalPrice: pairPrice * pairs,
            discountAmount: totalPairDiscount,
            finalPrice: (pairPrice * pairs) - totalPairDiscount,
          });

          totalDiscount += totalPairDiscount;
        }
      }
    }

    return {
      itemsWithDiscount,
      totalDiscount,
    };
  }
}
