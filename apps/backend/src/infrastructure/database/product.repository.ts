import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IProductRepository } from '../../domain/products/product.repository.interface';
import { Product } from '../../domain/products/product.entity';


/**
 * Infrastructure: Product Repository Implementation
 * Handles data persistence for Product aggregate
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    return products.map((product) => Product.create(product));
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    return product ? Product.create(product) : null;
  }

  async findByColor(color: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { color },
    });

    return product ? Product.create(product) : null;
  }
}
