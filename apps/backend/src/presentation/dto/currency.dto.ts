export class CurrencyDto {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
}

export class CurrencyListDto {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
}