import { PairDiscountStrategy } from '../src/domain/calculator/pair-discount.strategy';
import { Product } from '../src/domain/products/product.entity';
import { Decimal } from '@prisma/client/runtime/library';

function makeProduct(overrides: {
  id?: number;
  name?: string;
  color?: string;
  price: number;
  hasPairDiscount: boolean;
}): Product {
  return Product.create({
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Test Product',
    color: overrides.color ?? 'blue',
    price: new Decimal(overrides.price),
    currencyId: 1,
    hasPairDiscount: overrides.hasPairDiscount,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('PairDiscountStrategy', () => {
  let strategy: PairDiscountStrategy;

  beforeEach(() => {
    strategy = new PairDiscountStrategy();
  });

  describe('No discount eligible products', () => {
    it('should return zero discount for product with hasPairDiscount=false', () => {
      const product = makeProduct({ price: 100, hasPairDiscount: false });
      const result = strategy.calculate([{ product, quantity: 2 }]);

      expect(result.totalDiscount).toBe(0);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(0);
      expect(result.itemsWithDiscount[0].originalPrice).toBe(200);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(200);
    });

    it('should return zero discount for quantity=1 even if discount eligible', () => {
      const product = makeProduct({ price: 100, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 1 }]);

      expect(result.totalDiscount).toBe(0);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(0);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(100);
    });
  });

  describe('Pair discount calculation (5% per pair)', () => {
    it('should apply 5% on 1 pair (quantity=2)', () => {
      const product = makeProduct({ price: 100, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 2 }]);

      expect(result.totalDiscount).toBe(10);
      expect(result.itemsWithDiscount[0].originalPrice).toBe(200);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(10);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(190);
    });

    it('should apply 5% on 2 pairs (quantity=4)', () => {
      const product = makeProduct({ price: 100, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 4 }]);

      expect(result.totalDiscount).toBe(20);
      expect(result.itemsWithDiscount[0].originalPrice).toBe(400);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(20);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(380);
    });

    it('should apply discount only to pairs, not the single remainder (quantity=3)', () => {
      const product = makeProduct({ price: 100, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 3 }]);

      expect(result.totalDiscount).toBe(10);
      expect(result.itemsWithDiscount[0].originalPrice).toBe(300);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(10);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(290);
    });

    it('should apply 5% on 3 pairs (quantity=6)', () => {
      const product = makeProduct({ price: 50, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 6 }]);

      expect(result.totalDiscount).toBe(15);
      expect(result.itemsWithDiscount[0].originalPrice).toBe(300);
      expect(result.itemsWithDiscount[0].discountAmount).toBe(15);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(285);
    });

    it('should handle decimal prices with rounding to 2 decimal places', () => {
      const product = makeProduct({ price: 33.33, hasPairDiscount: true });
      const result = strategy.calculate([{ product, quantity: 2 }]);

      expect(result.totalDiscount).toBe(3.33);
      expect(result.itemsWithDiscount[0].finalPrice).toBe(63.33);
    });
  });

  describe('Multiple items', () => {
    it('should sum discounts across multiple eligible products', () => {
      const p1 = makeProduct({ id: 1, name: 'A', price: 100, hasPairDiscount: true });
      const p2 = makeProduct({ id: 2, name: 'B', price: 200, hasPairDiscount: true });

      const result = strategy.calculate([
        { product: p1, quantity: 2 },
        { product: p2, quantity: 2 },
      ]);

      expect(result.totalDiscount).toBe(30);
      expect(result.itemsWithDiscount).toHaveLength(2);
    });

    it('should only discount eligible items in a mixed order', () => {
      const eligible = makeProduct({ id: 1, name: 'Eligible', price: 100, hasPairDiscount: true });
      const notEligible = makeProduct({ id: 2, name: 'Not Eligible', price: 50, hasPairDiscount: false });

      const result = strategy.calculate([
        { product: eligible, quantity: 2 },
        { product: notEligible, quantity: 2 },
      ]);

      expect(result.totalDiscount).toBe(10);
      const eligibleResult = result.itemsWithDiscount.find(i => i.productName === 'Eligible')!;
      const notEligibleResult = result.itemsWithDiscount.find(i => i.productName === 'Not Eligible')!;

      expect(eligibleResult.discountAmount).toBe(10);
      expect(notEligibleResult.discountAmount).toBe(0);
      expect(notEligibleResult.originalPrice).toBe(100);
      expect(notEligibleResult.finalPrice).toBe(100);
    });
  });

  describe('Empty input', () => {
    it('should return zero totals for empty items array', () => {
      const result = strategy.calculate([]);

      expect(result.totalDiscount).toBe(0);
      expect(result.itemsWithDiscount).toHaveLength(0);
    });
  });
});
