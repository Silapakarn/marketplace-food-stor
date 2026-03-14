import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetProductsUseCase } from '../useCase/get-products.use-case';
import { GetDefaultCurrencyUseCase } from '../../currencies/useCase/get-currencies.use-case';
import { ProductDto } from '../../../presentation/dto/product.dto';
import Redis from 'ioredis';

@Injectable()
export class ProductResponseService {
  private readonly logger = new Logger(ProductResponseService.name);
  private readonly CACHE_KEY = 'products:formatted';
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getDefaultCurrencyUseCase: GetDefaultCurrencyUseCase,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis | null,
  ) {}

  async getFormattedProducts(): Promise<ProductDto[]> {
    if (this.redisClient) {
      try {
        const cachedProducts = await this.redisClient.get(this.CACHE_KEY);
        if (cachedProducts) {
          this.logger.log('Products retrieved from Redis cache');
          return JSON.parse(cachedProducts);
        }
      } catch (error) {
        this.logger.warn('Failed to get products from cache', error.message);
      }
    }

    const [products, defaultCurrency] = await Promise.all([
      this.getProductsUseCase.execute(),
      this.getDefaultCurrencyUseCase.execute(),
    ]);

    const currency = defaultCurrency || { 
      symbol: '฿', 
      formatAmount: (amount: number) => `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` 
    };

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.getPriceAsNumber(),
      currency: currency.symbol,
      color: product.color,
      imageUrl: product.imageUrl,
      hasPairDiscount: product.hasPairDiscount,
    }));

    if (this.redisClient) {
      try {
        await this.redisClient.setex(
          this.CACHE_KEY, 
          this.CACHE_TTL, 
          JSON.stringify(formattedProducts)
        );
        this.logger.log('Products cached in Redis');
      } catch (error) {
        this.logger.warn('Failed to cache products', error.message);
      }
    }

    return formattedProducts;
  }


}