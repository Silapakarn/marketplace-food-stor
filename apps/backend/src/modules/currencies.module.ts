import { Module } from '@nestjs/common';
import { CurrenciesController } from '../presentation/controllers/currencies.controller';
import { GetCurrenciesUseCase, GetDefaultCurrencyUseCase, GetCurrencyByCodeUseCase } from '../application/currencies/useCase/get-currencies.use-case';
import { CurrencyRepository } from '../infrastructure/database/currency.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../infrastructure/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CurrenciesController],
  providers: [
    {
      provide: 'CURRENCY_REPOSITORY',
      useClass: CurrencyRepository,
    },
    GetCurrenciesUseCase,
    GetDefaultCurrencyUseCase,
    GetCurrencyByCodeUseCase,
  ],
  exports: [
    'CURRENCY_REPOSITORY',
    GetDefaultCurrencyUseCase, // Export this so other modules can use it
  ],
})
export class CurrenciesModule {}