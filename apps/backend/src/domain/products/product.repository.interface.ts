import { Product } from './product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  findByColor(color: string): Promise<Product | null>;
}
