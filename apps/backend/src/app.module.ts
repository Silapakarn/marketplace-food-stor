import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ProductsModule } from './modules/products.module';
import { OrdersModule } from './modules/orders.module';

/**
 * Root Application Module
 * Orchestrates all feature modules in DDD architecture
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
