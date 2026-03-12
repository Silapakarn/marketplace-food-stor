import { Controller, Get, Param } from '@nestjs/common';
import { GetCurrenciesUseCase, GetDefaultCurrencyUseCase, GetCurrencyByCodeUseCase } from '../../application/currencies/useCase/get-currencies.use-case';
import { CurrencyDto, CurrencyListDto } from '../dto/currency.dto';

@Controller('currencies')
export class CurrenciesController {
  constructor(
    private readonly getCurrenciesUseCase: GetCurrenciesUseCase,
    private readonly getDefaultCurrencyUseCase: GetDefaultCurrencyUseCase,
    private readonly getCurrencyByCodeUseCase: GetCurrencyByCodeUseCase,
  ) {}

  @Get()
  async getAllCurrencies(): Promise<CurrencyListDto[]> {
    const currencies = await this.getCurrenciesUseCase.execute();
    
    return currencies.map((currency) => ({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isDefault: currency.isDefault,
    }));
  }

  @Get('default')
  async getDefaultCurrency(): Promise<CurrencyDto | null> {
    const currency = await this.getDefaultCurrencyUseCase.execute();
    
    if (!currency) return null;
    
    return {
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.getExchangeRate(),
      isDefault: currency.isDefault,
    };
  }

  @Get(':code')
  async getCurrencyByCode(@Param('code') code: string): Promise<CurrencyDto | null> {
    const currency = await this.getCurrencyByCodeUseCase.execute(code.toUpperCase());
    
    if (!currency) return null;
    
    return {
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.getExchangeRate(),
      isDefault: currency.isDefault,
    };
  }
}