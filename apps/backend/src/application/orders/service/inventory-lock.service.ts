import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface InventoryLockResult {
  success: boolean;
  lockKey?: string;
  expiresAt?: Date;
  message?: string;
}

@Injectable()
export class InventoryLockService {
  private readonly logger = new Logger(InventoryLockService.name);
  private redis: Redis | null = null;
  private readonly LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private readonly LOCK_DURATION_SEC = 3600; // 1 hour in seconds for Redis
  private readonly LOCK_PREFIX = 'inventory_lock:';
  private readonly USE_REDIS = process.env.USE_REDIS === 'true';
  
  // In-memory fallback for development only
  private memoryLocks = new Map<string, { customerIdentifier: string; expiresAt: number }>();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (!this.USE_REDIS) {
      this.logger.warn('Redis is disabled. Using in-memory locks for development. NOT suitable for production!');
      return;
    }

    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: true,
        connectTimeout: 10000,
      });

      this.redis.on('error', (error) => {
        this.logger.error(`Redis connection error: ${error.message}`);
        this.logger.warn('Falling back to in-memory locks. NOT suitable for production!');
        this.redis = null;
      });

      this.redis.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
      });

      await this.redis.ping();
    } catch (error) {
      this.logger.error(`Failed to initialize Redis: ${error.message}`);
      this.logger.warn('Using in-memory locks for development. NOT suitable for production!');
      this.redis = null;
    }
  }

  async acquireRedSetLock(productId: number, customerIdentifier: string): Promise<InventoryLockResult> {
    const lockKey = `${this.LOCK_PREFIX}red_set:${productId}`;

    return this.redis
      ? this.acquireRedisLock(lockKey, customerIdentifier, productId)
      : this.acquireMemoryLock(lockKey, customerIdentifier, productId);
  }

  private async acquireRedisLock(lockKey: string, customerIdentifier: string, productId: number): Promise<InventoryLockResult> {
    const lockValue = `${customerIdentifier}:${Date.now()}`;

    try {
      const result = await this.redis!.set(lockKey, lockValue, 'EX', this.LOCK_DURATION_SEC, 'NX');
      
      if (result === 'OK') {
        const expiresAt = new Date(Date.now() + this.LOCK_DURATION_MS);
        this.logger.log(`Red Set lock acquired for product ${productId} by ${customerIdentifier}`);
        
        return {
          success: true,
          lockKey,
          expiresAt,
          message: 'Red Set lock acquired successfully'
        };
      }

      // Lock exists, get TTL info
      const ttlRemaining = await this.redis!.ttl(lockKey);
      const message = this.buildLockDeniedMessage(ttlRemaining);
      
      this.logger.warn(`Red Set lock denied for product ${productId} by ${customerIdentifier}`);
      
      return { success: false, message };
    } catch (error) {
      this.logger.error(`Error acquiring Redis lock: ${error.message}`, error.stack);
      throw new ConflictException('Unable to process Red Set order at this time');
    }
  }

  private acquireMemoryLock(lockKey: string, customerIdentifier: string, productId: number): InventoryLockResult {
    this.cleanupExpiredMemoryLocks();

    const existingLock = this.memoryLocks.get(lockKey);
    const now = Date.now();
    
    if (existingLock && existingLock.expiresAt > now) {
      const minutesRemaining = Math.ceil((existingLock.expiresAt - now) / 60000);
      
      return {
        success: false,
        message: `Red Set is currently reserved by another customer. Please try again in ${minutesRemaining} minutes.`
      };
    }

    const expiresAt = new Date(now + this.LOCK_DURATION_MS);
    this.memoryLocks.set(lockKey, { 
      customerIdentifier, 
      expiresAt: expiresAt.getTime() 
    });
    
    this.logger.log(`Red Set lock acquired (memory) for product ${productId} by ${customerIdentifier}`);
    
    return {
      success: true,
      lockKey,
      expiresAt,
      message: 'Red Set lock acquired successfully (development mode)'
    };
  }

  async releaseRedSetLock(productId: number, customerIdentifier: string): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}red_set:${productId}`;

    return this.redis
      ? this.releaseRedisLock(lockKey, customerIdentifier, productId)
      : this.releaseMemoryLock(lockKey, customerIdentifier, productId);
  }

  private async releaseRedisLock(lockKey: string, customerIdentifier: string, productId: number): Promise<boolean> {
    try {
      // Atomic check-and-delete using Lua script - O(1)
      const luaScript = `
        local value = redis.call('GET', KEYS[1])
        if value and string.find(value, ARGV[1]) then
          return redis.call('DEL', KEYS[1])
        end
        return 0
      `;

      const result = await this.redis!.eval(luaScript, 1, lockKey, customerIdentifier);
      
      if (result === 1) {
        this.logger.log(`Red Set lock released for product ${productId} by ${customerIdentifier}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error releasing Redis lock: ${error.message}`, error.stack);
      return false;
    }
  }

  private releaseMemoryLock(lockKey: string, customerIdentifier: string, productId: number): boolean {
    const existingLock = this.memoryLocks.get(lockKey);
    
    if (existingLock && existingLock.customerIdentifier === customerIdentifier) {
      this.memoryLocks.delete(lockKey);
      this.logger.log(`Red Set lock released (memory) for product ${productId} by ${customerIdentifier}`);
      return true;
    }
    
    return false;
  }

  async isRedSetLocked(productId: number): Promise<{ locked: boolean; expiresAt?: Date }> {
    const lockKey = `${this.LOCK_PREFIX}red_set:${productId}`;

    return this.redis
      ? this.checkRedisLock(lockKey)
      : this.checkMemoryLock(lockKey);
  }

  private async checkRedisLock(lockKey: string): Promise<{ locked: boolean; expiresAt?: Date }> {
    try {
      const ttl = await this.redis!.ttl(lockKey);
      
      if (ttl > 0) {
        return {
          locked: true,
          expiresAt: new Date(Date.now() + (ttl * 1000))
        };
      }
      
      return { locked: false };
    } catch (error) {
      this.logger.error(`Error checking Redis lock status: ${error.message}`, error.stack);
      return { locked: false };
    }
  }

  private checkMemoryLock(lockKey: string): { locked: boolean; expiresAt?: Date } {
    this.cleanupExpiredMemoryLocks();
    
    const existingLock = this.memoryLocks.get(lockKey);
    const now = Date.now();
    
    if (existingLock && existingLock.expiresAt > now) {
      return {
        locked: true,
        expiresAt: new Date(existingLock.expiresAt)
      };
    }
    
    return { locked: false };
  }

  private cleanupExpiredMemoryLocks(): void {
    const now = Date.now();
    for (const [key, lock] of this.memoryLocks.entries()) {
      if (lock.expiresAt <= now) {
        this.memoryLocks.delete(key);
      }
    }
  }

  private buildLockDeniedMessage(ttlRemaining: number): string {
    if (ttlRemaining <= 0) {
      return 'Red Set is currently reserved by another customer';
    }
    
    const minutesRemaining = Math.ceil(ttlRemaining / 60);
    return `Red Set is currently reserved by another customer. Please try again in ${minutesRemaining} minutes.`;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryLocks.clear();
  }
}