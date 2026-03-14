import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisEnabled = configService.get('REDIS_ENABLED', 'false') === 'true';
        
        if (!redisEnabled) {
          return null;
        }

        const redisUrl = configService.get('REDIS_URL');
        const redisUsername = configService.get('REDIS_USERNAME');
        const redisPassword = configService.get('REDIS_PASSWORD');
        
        if (redisUrl && redisUsername && redisPassword) {
          return new Redis({
            host: redisUrl,
            port: configService.get('REDIS_PORT', 6379),
            username: redisUsername,
            password: redisPassword,
            retryStrategy: (times) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            connectTimeout: 10000,
            lazyConnect: true,
          });
        } else {
          return new Redis({
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            retryStrategy: (times) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
          });
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
