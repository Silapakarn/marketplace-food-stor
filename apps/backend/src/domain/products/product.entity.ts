import { Decimal } from '@prisma/client/runtime/library';

export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly color: string,
    public readonly price: Decimal,
    public readonly hasPairDiscount: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getPriceAsNumber(): number {
    return this.price.toNumber();
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
    hasPairDiscount: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      data.id,
      data.name,
      data.color,
      data.price,
      data.hasPairDiscount,
      data.createdAt,
      data.updatedAt,
    );
  }
}
