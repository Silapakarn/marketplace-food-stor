import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICurrencyRepository } from '../../domain/currencies/currency.repository.interface';
import { Currency } from '../../domain/currencies/currency.entity';
import Redis from 'ioredis';

@Injectable()
export class CurrencyRepository implements ICurrencyRepository {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'currency:';

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async findAll(): Promise<Currency[]> {
    const cacheKey = `${this.CACHE_PREFIX}all`;
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return data.map((item: any) => Currency.create(item));
    }

    // If not in cache, fetch from database
    const currencies = await this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    const result = currencies.map((currency) => Currency.create(currency));
    
    // Cache the result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(currencies));
    
    return result;
  }

  async findByCode(code: string): Promise<Currency | null> {
    const cacheKey = `${this.CACHE_PREFIX}code:${code}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return Currency.create(data);
    }

    // Fetch from database
    const currency = await this.prisma.currency.findUnique({
      where: { code, isActive: true },
    });

    if (!currency) return null;

    const result = Currency.create(currency);
    
    // Cache the result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(currency));
    
    return result;
  }

  async findDefault(): Promise<Currency | null> {
    const cacheKey = `${this.CACHE_PREFIX}default`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return Currency.create(data);
    }

    // Fetch from database
    const currency = await this.prisma.currency.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (!currency) return null;

    const result = Currency.create(currency);
    
    // Cache the result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(currency));
    
    return result;
  }

  async findById(id: number): Promise<Currency | null> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return Currency.create(data);
    }

    // Fetch from database
    const currency = await this.prisma.currency.findUnique({
      where: { id, isActive: true },
    });

    if (!currency) return null;

    const result = Currency.create(currency);
    
    // Cache the result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(currency));
    
    return result;
  }

  async create(data: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>): Promise<Currency> {
    const currency = await this.prisma.currency.create({
      data: {
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        exchangeRate: data.getExchangeRate(),
        isActive: data.isActive,
        isDefault: data.isDefault,
      },
    });

    // Clear related caches
    await this.clearCaches(data.code);
    
    return Currency.create(currency);
  }

  async update(id: number, data: Partial<Currency>): Promise<Currency> {
    const currency = await this.prisma.currency.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.symbol && { symbol: data.symbol }),
        ...(data.getExchangeRate && { exchangeRate: data.getExchangeRate() }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    // Clear related caches
    await this.clearCaches(currency.code);
    
    return Currency.create(currency);
  }

  private async clearCaches(code?: string): Promise<void> {
    const keys = [
      `${this.CACHE_PREFIX}all`,
      `${this.CACHE_PREFIX}default`,
    ];
    
    if (code) {
      keys.push(`${this.CACHE_PREFIX}code:${code}`);
    }
    
    await Promise.all(keys.map(key => this.redis.del(key)));
  }
}