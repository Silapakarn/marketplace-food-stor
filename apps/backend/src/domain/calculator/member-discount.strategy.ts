import { MEMBER_DISCOUNT_RATE } from '../../shared/constants/calculator';
import { roundToTwo } from '../../shared/utils/format';

export class MemberDiscountStrategy {
  calculate(afterPairDiscount: number): number {
    return roundToTwo(afterPairDiscount * MEMBER_DISCOUNT_RATE);
  }
}
