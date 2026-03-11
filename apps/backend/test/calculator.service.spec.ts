import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorService } from '../src/application/calculator/calculator.service';
import { Product } from '../src/domain/products/product.entity';
import { Decimal } from '@prisma/client/runtime/library';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculatorService],
    }).compile();

    service = module.get<CalculatorService>(CalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  

  describe('calculate - Basic Calculation', () => {
    it('should calculate total without any discounts', () => {
      const redSet = Product.create({
        id: 1,
        name: 'Red Set',
        color: 'red',
        price: new Decimal(50),
        hasPairDiscount: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: redSet, quantity: 2 }],
      });

      expect(result.totalBeforeDiscount).toBe(100);
      expect(result.pairDiscount).toBe(0);
      expect(result.memberDiscount).toBe(0);
      expect(result.finalTotal).toBe(100);
    });
  });

  describe('calculate - Pair Discount', () => {
    it('should apply 5% discount for Orange set pair (2 items)', () => {
      const orangeSet = Product.create({
        id: 7,
        name: 'Orange Set',
        color: 'orange',
        price: new Decimal(120),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: orangeSet, quantity: 2 }],
      });

      // Orange x2 = (120 + 120) - 5% = 240 - 12 = 228
      expect(result.totalBeforeDiscount).toBe(240);
      expect(result.pairDiscount).toBe(12);
      expect(result.finalTotal).toBe(228);
      expect(result.itemsWithPairDiscount).toHaveLength(1);
    });

    it('should apply 5% discount for Pink set pairs (4 items = 2 pairs)', () => {
      const pinkSet = Product.create({
        id: 5,
        name: 'Pink Set',
        color: 'pink',
        price: new Decimal(80),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: pinkSet, quantity: 4 }],
      });

      // Pink x4 = (80 + 80) - 5% + (80 + 80) - 5%
      // = 160 - 8 + 160 - 8 = 304
      expect(result.totalBeforeDiscount).toBe(320);
      expect(result.pairDiscount).toBe(16);
      expect(result.finalTotal).toBe(304);
    });

    it('should apply 5% discount only for pairs (3 items = 1 pair + 1 single)', () => {
      const greenSet = Product.create({
        id: 2,
        name: 'Green Set',
        color: 'green',
        price: new Decimal(40),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: greenSet, quantity: 3 }],
      });

      // Green x3 = (40 + 40) - 5% + 40 = 76 + 40 = 116
      expect(result.totalBeforeDiscount).toBe(120);
      expect(result.pairDiscount).toBe(4);
      expect(result.finalTotal).toBe(116);
    });
  });

  describe('calculate - Member Discount', () => {
    it('should apply 10% member discount on total', () => {
      const redSet = Product.create({
        id: 1,
        name: 'Red Set',
        color: 'red',
        price: new Decimal(50),
        hasPairDiscount: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: redSet, quantity: 2 }],
        memberCardNumber: 'MEMBER123',
      });

      // Red x2 = 100, Member discount = 10% = 10
      expect(result.totalBeforeDiscount).toBe(100);
      expect(result.memberDiscount).toBe(10);
      expect(result.finalTotal).toBe(90);
    });
  });

  describe('calculate - Combined Discounts', () => {
    it('should apply pair discount first, then member discount', () => {
      const orangeSet = Product.create({
        id: 7,
        name: 'Orange Set',
        color: 'orange',
        price: new Decimal(120),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: orangeSet, quantity: 2 }],
        memberCardNumber: 'MEMBER456',
      });

      // Orange x2 = 240
      // Pair discount (5%) = 12, subtotal = 228
      // Member discount (10% of 228) = 22.8
      // Final = 205.2
      expect(result.totalBeforeDiscount).toBe(240);
      expect(result.pairDiscount).toBe(12);
      expect(result.memberDiscount).toBe(22.8);
      expect(result.finalTotal).toBe(205.2);
    });

    it('should handle complex order with multiple product types', () => {
      const orangeSet = Product.create({
        id: 7,
        name: 'Orange Set',
        color: 'orange',
        price: new Decimal(120),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const redSet = Product.create({
        id: 1,
        name: 'Red Set',
        color: 'red',
        price: new Decimal(50),
        hasPairDiscount: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const greenSet = Product.create({
        id: 2,
        name: 'Green Set',
        color: 'green',
        price: new Decimal(40),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [
          { product: orangeSet, quantity: 2 },
          { product: redSet, quantity: 1 },
          { product: greenSet, quantity: 3 },
        ],
        memberCardNumber: 'MEMBER789',
      });

      // Orange x2 = 240 - 12 (pair discount) = 228
      // Red x1 = 50
      // Green x3 = 120 - 4 (pair discount for 2) = 116
      // Total before discount = 410
      // After pair discount = 394
      // Member discount (10% of 394) = 39.4
      // Final = 354.6
      expect(result.totalBeforeDiscount).toBe(410);
      expect(result.pairDiscount).toBe(16);
      expect(result.memberDiscount).toBe(39.4);
      expect(result.finalTotal).toBe(354.6);
    });
  });

  describe('calculate - Edge Cases', () => {
    it('should handle empty cart', () => {
      const result = service.calculate({
        items: [],
      });

      expect(result.totalBeforeDiscount).toBe(0);
      expect(result.pairDiscount).toBe(0);
      expect(result.memberDiscount).toBe(0);
      expect(result.finalTotal).toBe(0);
    });

    it('should handle single item with pair discount (no discount applied)', () => {
      const pinkSet = Product.create({
        id: 5,
        name: 'Pink Set',
        color: 'pink',
        price: new Decimal(80),
        hasPairDiscount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = service.calculate({
        items: [{ product: pinkSet, quantity: 1 }],
      });

      expect(result.totalBeforeDiscount).toBe(80);
      expect(result.pairDiscount).toBe(0);
      expect(result.finalTotal).toBe(80);
    });
  });
});
