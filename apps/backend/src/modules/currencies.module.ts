import { Module } from '@nestjs/common';
import { GetDefaultCurrencyUseCase } from '../application/currencies/useCase/get-currencies.use-case';
import { CurrencyRepository } from '../infrastructure/database/currency.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../infrastructure/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    {
      provide: 'CURRENCY_REPOSITORY',
      useClass: CurrencyRepository,
    },
    GetDefaultCurrencyUseCase,
  ],
  exports: [GetDefaultCurrencyUseCase],
})
export class CurrenciesModule {}
