import { Product } from '../products/product.entity';

export interface OrderItemInput {
  product: Product;
  quantity: number;
}

export interface PairBreakdown {
  pairs: number;
  remaining: number;
  pricePerPair: number;
  discountPerPair: number;
  totalPairDiscount: number;
}

export interface DiscountResult {
  itemsWithDiscount: Array<{
    productName: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    pairBreakdown?: PairBreakdown;
  }>;
  totalDiscount: number;
}

export interface IDiscountStrategy {
  calculate(items: OrderItemInput[]): DiscountResult;
}
