import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../domain/products/product.repository.interface';
import { Product } from '../../domain/products/product.entity';


/**
 * Use Case: Get All Products
 * Application logic for retrieving product list
 */
@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }
}
