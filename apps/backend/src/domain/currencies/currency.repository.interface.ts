import { Currency } from './currency.entity';

export interface ICurrencyRepository {
  findAll(): Promise<Currency[]>;
  findByCode(code: string): Promise<Currency | null>;
  findDefault(): Promise<Currency | null>;
  findById(id: number): Promise<Currency | null>;
  create(data: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>): Promise<Currency>;
  update(id: number, data: Partial<Currency>): Promise<Currency>;
}