import { Module } from '@nestjs/common';
import { ProductsController } from '../presentation/controllers/products.controller';
import { GetProductsUseCase } from '../application/products/get-products.use-case';
import { ProductRepository } from '../infrastructure/database/product.repository';
import { IProductRepository } from '../domain/products/product.repository.interface';

/**
 * Products Module
 * Encapsulates all product-related functionality following DDD
 */
@Module({
  controllers: [ProductsController],
  providers: [
    GetProductsUseCase,
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
  exports: [IProductRepository],
})
export class ProductsModule {}
