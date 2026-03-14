import { Product } from './product.entity';

export interface FindAllOptions {
  select?: {
    id?: boolean;
    name?: boolean;
    price?: boolean;
    color?: boolean;
    imageUrl?: boolean;
    currencyId?: boolean;
    hasPairDiscount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };
  orderBy?: {
    id?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
    price?: 'asc' | 'desc';
    color?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    updatedAt?: 'asc' | 'desc';
  };
}

export interface IProductRepository {
  findAll(options?: FindAllOptions): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
}
