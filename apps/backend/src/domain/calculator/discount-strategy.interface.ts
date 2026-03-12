import { Product } from '../products/product.entity';

export interface OrderItemInput {
  product: Product;
  quantity: number;
}

export interface DiscountResult {
  itemsWithDiscount: Array<{
    productName: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  }>;
  totalDiscount: number;
}

export interface IDiscountStrategy {
  calculate(items: OrderItemInput[]): DiscountResult;
}
