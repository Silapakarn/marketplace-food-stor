import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IProductRepository, FindAllOptions } from '../../domain/products/product.repository.interface';
import { Product } from '../../domain/products/product.entity';

/**
 * Infrastructure: Product Repository Implementation
 * Handles data persistence for Product aggregate
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: FindAllOptions): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      select: options?.select || {
        id: true,
        name: true,
        price: true,
        color: true,
        imageUrl: true,
        currencyId: true,
        hasPairDiscount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: options?.orderBy || { id: 'asc' },
    });

    return products.map((product) => Product.create(product));
  }

  async findAllWithCurrency(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: {
        currency: true,
      },
      orderBy: { id: 'asc' },
    });

    return products.map((product) => Product.create({
      id: product.id,
      name: product.name,
      color: product.color,
      price: product.price,
      imageUrl: product.imageUrl,
      currencyId: product.currencyId,
      hasPairDiscount: product.hasPairDiscount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
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
