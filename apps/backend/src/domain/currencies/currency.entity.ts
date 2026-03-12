import { Decimal } from '@prisma/client/runtime/library';

export class Currency {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly symbol: string,
    private readonly exchangeRate: Decimal,
    public readonly isActive: boolean,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: Decimal;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Currency {
    return new Currency(
      data.id,
      data.code,
      data.name,
      data.symbol,
      data.exchangeRate,
      data.isActive,
      data.isDefault,
      data.createdAt,
      data.updatedAt,
    );
  }

  getExchangeRate(): number {
    return this.exchangeRate.toNumber();
  }

  formatAmount(amount: number): string {
    if (this.code === 'THB') {
      return `${this.symbol}${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
    }
    return `${this.symbol}${amount.toFixed(2)}`;
  }

  convertFromBase(baseAmount: number): number {
    return baseAmount * this.getExchangeRate();
  }

  convertToBase(amount: number): number {
    return amount / this.getExchangeRate();
  }
}