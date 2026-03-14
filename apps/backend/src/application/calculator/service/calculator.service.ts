import { Injectable } from '@nestjs/common';
import { PairDiscountStrategy } from '../../../domain/calculator/pair-discount.strategy';
import { MemberDiscountStrategy } from '../../../domain/calculator/member-discount.strategy';
import { Product } from '../../../domain/products/product.entity';
import { roundToTwo } from '../../../shared/utils/format';

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
  private readonly memberDiscountStrategy = new MemberDiscountStrategy();

  calculate(input: CalculateOrderInput): CalculationResult {
    const pairResult = this.pairDiscountStrategy.calculate(input.items);

    const totalBeforeDiscount = roundToTwo(
      pairResult.itemsWithDiscount.reduce((sum, item) => sum + item.originalPrice, 0),
    );

    const afterPairDiscount = roundToTwo(totalBeforeDiscount - pairResult.totalDiscount);

    const memberDiscount = input.memberCardNumber
      ? this.memberDiscountStrategy.calculate(afterPairDiscount)
      : 0;

    const finalTotal = roundToTwo(afterPairDiscount - memberDiscount);

    return {
      totalBeforeDiscount,
      pairDiscount: pairResult.totalDiscount,
      memberDiscount,
      finalTotal,
      itemsWithPairDiscount: pairResult.itemsWithDiscount,
      breakdown: {
        subtotal: totalBeforeDiscount,
        afterPairDiscount,
        afterMemberDiscount: finalTotal,
      },
    };
  }
}
