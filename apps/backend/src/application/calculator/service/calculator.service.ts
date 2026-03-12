import { Injectable } from '@nestjs/common';
import { PairDiscountStrategy } from '../../../domain/calculator/pair-discount.strategy';
import { MemberDiscountStrategy } from '../../../domain/calculator/member-discount.strategy';
import { Product } from '../../../domain/products/product.entity';

export interface CalculateOrderInput {
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  memberCardNumber?: string;
}

export interface CalculationResult {
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

@Injectable()
export class CalculatorService {
  private readonly pairDiscountStrategy = new PairDiscountStrategy();
  private readonly MEMBER_DISCOUNT_RATE = 0.10;
  
  calculate(input: CalculateOrderInput): CalculationResult {
    // Calculate total before discount in single pass - O(n)
    let totalBeforeDiscount = 0;
    for (const item of input.items) {
      totalBeforeDiscount += item.product.getPriceAsNumber() * item.quantity;
    }
    totalBeforeDiscount = this.roundToTwo(totalBeforeDiscount);

    // Get pair discount results - O(n)
    const pairDiscountResult = this.pairDiscountStrategy.calculate(input.items);

    // Build product name to item map for O(1) lookup - O(n)
    const productMap = new Map(
      input.items.map(item => [item.product.name, item])
    );

    // Add detailed pair breakdown - O(n) instead of O(n²)
    const itemsWithDetailedBreakdown = pairDiscountResult.itemsWithDiscount.map(item => {
      const originalItem = productMap.get(item.productName);
      
      if (!originalItem || !originalItem.product.canHavePairDiscount()) {
        return item;
      }

      const pairs = Math.floor(originalItem.quantity / 2);
      
      if (pairs === 0) {
        return item;
      }

      const remaining = originalItem.quantity % 2;
      const unitPrice = originalItem.product.getPriceAsNumber();
      const pairPrice = unitPrice * 2;
      const discountPerPair = pairPrice * 0.05;
      const totalPairDiscount = discountPerPair * pairs;
      
      return {
        ...item,
        pairBreakdown: {
          pairs,
          remaining,
          pricePerPair: this.roundToTwo(pairPrice),
          discountPerPair: this.roundToTwo(discountPerPair),
          totalPairDiscount: this.roundToTwo(totalPairDiscount),
        }
      };
    });

    const afterPairDiscount = this.roundToTwo(totalBeforeDiscount - pairDiscountResult.totalDiscount);

    const memberDiscount = input.memberCardNumber 
      ? this.roundToTwo(afterPairDiscount * this.MEMBER_DISCOUNT_RATE)
      : 0;

    const finalTotal = this.roundToTwo(afterPairDiscount - memberDiscount);

    return {
      totalBeforeDiscount,
      pairDiscount: pairDiscountResult.totalDiscount,
      memberDiscount,
      finalTotal,
      itemsWithPairDiscount: itemsWithDetailedBreakdown,
      breakdown: {
        subtotal: totalBeforeDiscount,
        afterPairDiscount,
        afterMemberDiscount: finalTotal,
      },
    };
  }

  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
