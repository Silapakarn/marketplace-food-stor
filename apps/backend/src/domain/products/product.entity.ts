import { Decimal } from '@prisma/client/runtime/library';

export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly color: string,
    private readonly price: Decimal,
    public readonly imageUrl: string | null,
    public readonly currencyId: number,
    public readonly hasPairDiscount: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getPriceAsNumber(): number {
    return Math.round(this.price.toNumber() * 100) / 100;
  }

  canHavePairDiscount(): boolean {
    return this.hasPairDiscount;
  }

  isRedSet(): boolean {
    return this.color.toLowerCase() === 'red';
  }

  static create(data: {
    id: number;
    name: string;
    color: string;
    price: Decimal;
    imageUrl?: string | null;
    currencyId: number;
    hasPairDiscount: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      data.id,
      data.name,
      data.color,
      data.price,
      data.imageUrl || null,
      data.currencyId,
      data.hasPairDiscount,
      data.createdAt,
      data.updatedAt,
    );
  }
}
