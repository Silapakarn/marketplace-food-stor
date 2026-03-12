import { Module } from '@nestjs/common';
import { ProductsController } from '../presentation/controllers/products.controller';
import { GetProductsUseCase } from '../application/products/useCase/get-products.use-case';
import { ProductResponseService } from '../application/products/service/product-response.service';
import { ProductRepository } from '../infrastructure/database/product.repository';
import { CurrenciesModule } from './currencies.module';

/**
 * Products Module
 * Encapsulates all product-related functionality following DDD
 */
@Module({
  imports: [CurrenciesModule],
  controllers: [ProductsController],
  providers: [
    GetProductsUseCase,
    ProductResponseService,
    {
      provide: 'PRODUCT_REPOSITORY',
      useClass: ProductRepository,
    },
  ],
  exports: ['PRODUCT_REPOSITORY'],
})
export class ProductsModule {}
