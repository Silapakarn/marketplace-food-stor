import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/products/product.repository.interface';
import { Product } from '../../../domain/products/product.entity';

@Injectable()
export class GetProductsUseCase {
  constructor(@Inject('PRODUCT_REPOSITORY') private readonly productRepository: IProductRepository) {}

  execute(): Promise<Product[]> {
    return this.productRepository.findAll({
      select: {
        id: true,
        name: true,
        price: true,
        color: true,
        hasPairDiscount: true,
        imageUrl: true,
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
