import { Injectable, Inject } from '@nestjs/common';
import { ICurrencyRepository } from '../../../domain/currencies/currency.repository.interface';
import { Currency } from '../../../domain/currencies/currency.entity';

@Injectable()
export class GetDefaultCurrencyUseCase {
  constructor(@Inject('CURRENCY_REPOSITORY') private readonly currencyRepository: ICurrencyRepository) {}

  execute(): Promise<Currency | null> {
    return this.currencyRepository.findDefault();
  }
}
