import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ProductsModule } from './modules/products.module';
import { OrdersModule } from './modules/orders.module';
import { CurrenciesModule } from './modules/currencies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    ProductsModule,
    OrdersModule,
    CurrenciesModule,
  ],
})
export class AppModule {}
