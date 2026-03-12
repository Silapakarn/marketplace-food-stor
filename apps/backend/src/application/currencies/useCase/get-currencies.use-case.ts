import { Injectable, Inject } from '@nestjs/common';
import { ICurrencyRepository } from '../../../domain/currencies/currency.repository.interface';
import { Currency } from '../../../domain/currencies/currency.entity';

@Injectable()
export class GetCurrenciesUseCase {
  constructor(@Inject('CURRENCY_REPOSITORY') private readonly currencyRepository: ICurrencyRepository) {}

  async execute(): Promise<Currency[]> {
    return this.currencyRepository.findAll();
  }
}

@Injectable()
export class GetDefaultCurrencyUseCase {
  constructor(@Inject('CURRENCY_REPOSITORY') private readonly currencyRepository: ICurrencyRepository) {}

  async execute(): Promise<Currency | null> {
    return this.currencyRepository.findDefault();
  }
}

@Injectable()
export class GetCurrencyByCodeUseCase {
  constructor(@Inject('CURRENCY_REPOSITORY') private readonly currencyRepository: ICurrencyRepository) {}

  async execute(code: string): Promise<Currency | null> {
    return this.currencyRepository.findByCode(code);
  }
}