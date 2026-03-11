import { Injectable } from '@nestjs/common';
import { PairDiscountStrategy } from '../../domain/calculator/pair-discount.strategy';
import { MemberDiscountStrategy } from '../../domain/calculator/member-discount.strategy';
import { Product } from '../../domain/products/product.entity';


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
  }>;
  breakdown: {
    subtotal: number;
    afterPairDiscount: number;
    afterMemberDiscount: number;
  };
}

/**
 * Application Service: Calculator
 * Orchestrates discount strategies and business rules
 */
@Injectable()
export class CalculatorService {
  private readonly pairDiscountStrategy = new PairDiscountStrategy();
  private readonly memberDiscountStrategy = new MemberDiscountStrategy();

  calculate(input: CalculateOrderInput): CalculationResult {
    // Calculate subtotal
    const totalBeforeDiscount = input.items.reduce((sum, item) => {
      return sum + (item.product.getPriceAsNumber() * item.quantity);
    }, 0);

    // Apply pair discount strategy
    const pairDiscountResult = this.pairDiscountStrategy.calculate(input.items);

    // Calculate after pair discount
    const afterPairDiscount = totalBeforeDiscount - pairDiscountResult.totalDiscount;

    // Apply member discount strategy (on total after pair discount)
    let memberDiscount = 0;
    if (input.memberCardNumber && input.memberCardNumber.length > 0) {
      memberDiscount = afterPairDiscount * 0.10; // 10% member discount
    }

    // Calculate final total
    const finalTotal = afterPairDiscount - memberDiscount;

    return {
      totalBeforeDiscount,
      pairDiscount: pairDiscountResult.totalDiscount,
      memberDiscount,
      finalTotal,
      itemsWithPairDiscount: pairDiscountResult.itemsWithDiscount,
      breakdown: {
        subtotal: totalBeforeDiscount,
        afterPairDiscount,
        afterMemberDiscount: finalTotal,
      },
    };
  }
}
