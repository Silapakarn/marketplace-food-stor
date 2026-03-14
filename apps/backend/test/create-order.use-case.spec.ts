import { BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from '../src/application/orders/useCase/create-order.use-case';
import { Product } from '../src/domain/products/product.entity';
import { Decimal } from '@prisma/client/runtime/library';


function makeProduct(color: string, hasPairDiscount = false): Product {
  return Product.create({
    id: 1,
    name: `${color} Set`,
    color,
    price: new Decimal(50),
    currencyId: 1,
    hasPairDiscount,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(redisGetValue: string | null) {
  const mockOrderRepo = {
    create: jest.fn().mockResolvedValue({ id: 99, finalTotal: 100 }),
  };
  const mockProductRepo = {
    findById: jest.fn(),
  };
  const mockCalculator = {
    calculate: jest.fn().mockReturnValue({
      totalBeforeDiscount: 100,
      pairDiscount: 0,
      memberDiscount: 0,
      finalTotal: 100,
      itemsWithPairDiscount: [],
      breakdown: { subtotal: 100, afterPairDiscount: 100, afterMemberDiscount: 100 },
    }),
  };
  const mockRedis = {
    get: jest.fn().mockResolvedValue(redisGetValue),
    setex: jest.fn().mockResolvedValue('OK'),
  };

  const useCase = new CreateOrderUseCase(
    mockOrderRepo as any,
    mockProductRepo as any,
    mockCalculator as any,
    mockRedis as any,
  );

  return { useCase, mockProductRepo, mockRedis };
}


describe('CreateOrderUseCase – Red Set 1-hour restriction', () => {
  it('should allow Red Set order when no previous order exists in Redis', async () => {
    const { useCase, mockProductRepo } = makeUseCase(null);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).resolves.not.toThrow();
  });

  it('should allow Red Set order when last order was exactly 1 hour ago', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(oneHourAgo);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).resolves.not.toThrow();
  });

  it('should allow Red Set order when last order was more than 1 hour ago', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(twoHoursAgo);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).resolves.not.toThrow();
  });

  it('should throw BadRequestException when last Red Set order was less than 1 hour ago', async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(thirtyMinutesAgo);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should include remaining minutes in error message (30 min elapsed → ~30 min remaining)', async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(thirtyMinutesAgo);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    try {
      await useCase.execute({ items: [{ productId: 1, quantity: 1 }] });
      fail('Expected to throw');
    } catch (err: any) {
      expect(err.message).toMatch(/minute/i);
      const minuteMatch = err.message.match(/(\d+)/);
      const minutes = parseInt(minuteMatch![1], 10);
      expect(minutes).toBeGreaterThanOrEqual(29);
      expect(minutes).toBeLessThanOrEqual(31);
    }
  });

  it('should include remaining minutes when 1 minute has elapsed (~59 min remaining)', async () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(oneMinuteAgo);
    const redProduct = makeProduct('red');
    mockProductRepo.findById.mockResolvedValue(redProduct);

    try {
      await useCase.execute({ items: [{ productId: 1, quantity: 1 }] });
      fail('Expected to throw');
    } catch (err: any) {
      const minuteMatch = err.message.match(/(\d+)/);
      const minutes = parseInt(minuteMatch![1], 10);
      expect(minutes).toBeGreaterThanOrEqual(58);
      expect(minutes).toBeLessThanOrEqual(60);
    }
  });

  it('should NOT enforce restriction for non-red products', async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(fifteenMinutesAgo);
    const blueProduct = makeProduct('blue');
    mockProductRepo.findById.mockResolvedValue(blueProduct);

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).resolves.not.toThrow();
  });

  it('should be case-insensitive for red color check (RED, Red)', async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { useCase: useCase1, mockProductRepo: mp1 } = makeUseCase(fifteenMinutesAgo);
    mp1.findById.mockResolvedValue(makeProduct('RED'));
    await expect(
      useCase1.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);

    const { useCase: useCase2, mockProductRepo: mp2 } = makeUseCase(fifteenMinutesAgo);
    mp2.findById.mockResolvedValue(makeProduct('Red'));
    await expect(
      useCase2.execute({ items: [{ productId: 1, quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });
});


describe('CreateOrderUseCase – remaining minutes calculation', () => {
  it('calculates remainingMinutes = ceil((1 - hoursDiff) * 60)', () => {
    const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(fortyFiveMinutesAgo);
    mockProductRepo.findById.mockResolvedValue(makeProduct('red'));

    return useCase.execute({ items: [{ productId: 1, quantity: 1 }] }).catch((err: any) => {
      const minuteMatch = err.message.match(/(\d+)/);
      const minutes = parseInt(minuteMatch![1], 10);
      expect(minutes).toBeGreaterThanOrEqual(14);
      expect(minutes).toBeLessThanOrEqual(16);
    });
  });

  it('calculates remainingMinutes = ceil((1 - hoursDiff) * 60) for 59 minutes elapsed → 1 min remaining', () => {
    const fiftyNineMinutesAgo = new Date(Date.now() - 59 * 60 * 1000).toISOString();
    const { useCase, mockProductRepo } = makeUseCase(fiftyNineMinutesAgo);
    mockProductRepo.findById.mockResolvedValue(makeProduct('red'));

    return useCase.execute({ items: [{ productId: 1, quantity: 1 }] }).catch((err: any) => {
      const minuteMatch = err.message.match(/(\d+)/);
      const minutes = parseInt(minuteMatch![1], 10);
      expect(minutes).toBeGreaterThanOrEqual(1);
      expect(minutes).toBeLessThanOrEqual(2);
    });
  });
});


describe('CreateOrderUseCase – quantity validation', () => {
  it('should throw BadRequestException when quantity is 0', async () => {
    const { useCase, mockProductRepo } = makeUseCase(null);
    mockProductRepo.findById.mockResolvedValue(makeProduct('blue'));

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: 0 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when quantity is negative', async () => {
    const { useCase, mockProductRepo } = makeUseCase(null);
    mockProductRepo.findById.mockResolvedValue(makeProduct('blue'));

    await expect(
      useCase.execute({ items: [{ productId: 1, quantity: -1 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when product is not found', async () => {
    const { useCase, mockProductRepo } = makeUseCase(null);
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ items: [{ productId: 999, quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });
});
