import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InventoryLockResult {
  success: boolean;
  lockKey?: string;
  expiresAt?: Date;
  message?: string;
}


@Injectable()
export class InventoryLockService {
  private readonly logger = new Logger(InventoryLockService.name);
  private readonly LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private readonly LOCK_PREFIX = 'red_set';

  constructor(private readonly prisma: PrismaService) {}

  
  async acquireRedSetLock(
    productId: number,
    customerIdentifier: string,
  ): Promise<InventoryLockResult> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.LOCK_DURATION_MS);
    const lockKey = `${this.LOCK_PREFIX}:${productId}`;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existingLock = await tx.inventoryLock.findUnique({
          where: {
            lockKey: lockKey,
          },
        });

        if (existingLock && existingLock.expiresAt > now) {
          const minutesRemaining = Math.ceil(
            (existingLock.expiresAt.getTime() - now.getTime()) / 60000,
          );
          
          return {
            success: false,
            message: `Red Set is currently reserved by another customer. Please try again in ${minutesRemaining} minute(s).`,
            expiresAt: existingLock.expiresAt,
          };
        }

        const lock = await tx.inventoryLock.upsert({
          where: {
            lockKey: lockKey,
          },
          create: {
            lockKey: lockKey,
            productId: productId,
            customerIdentifier: customerIdentifier,
            expiresAt: expiresAt,
          },
          update: {
            customerIdentifier: customerIdentifier,
            expiresAt: expiresAt,
            acquiredAt: now,
          },
        });

        this.logger.log(
          `Red Set lock acquired for product ${productId} by ${customerIdentifier}`,
        );

        return {
          success: true,
          lockKey: lock.lockKey,
          expiresAt: lock.expiresAt,
          message: 'Red Set lock acquired successfully',
        };
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Error acquiring Red Set lock: ${error.message}`,
        error.stack,
      );
      throw new ConflictException(
        'Unable to process Red Set order at this time',
      );
    }
  }

  async releaseRedSetLock(
    productId: number,
    customerIdentifier: string,
  ): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}:${productId}`;

    try {
      const result = await this.prisma.inventoryLock.deleteMany({
        where: {
          lockKey: lockKey,
          customerIdentifier: customerIdentifier,
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Red Set lock released for product ${productId} by ${customerIdentifier}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error releasing Red Set lock: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async isRedSetLocked(
    productId: number,
  ): Promise<{ locked: boolean; expiresAt?: Date }> {
    const lockKey = `${this.LOCK_PREFIX}:${productId}`;
    const now = new Date();

    try {
      const lock = await this.prisma.inventoryLock.findUnique({
        where: {
          lockKey: lockKey,
        },
      });

      if (lock && lock.expiresAt > now) {
        return {
          locked: true,
          expiresAt: lock.expiresAt,
        };
      }

      if (lock && lock.expiresAt <= now) {
        await this.prisma.inventoryLock.delete({
          where: {
            lockKey: lockKey,
          },
        });
      }

      return { locked: false };
    } catch (error) {
      this.logger.error(
        `Error checking Red Set lock status: ${error.message}`,
        error.stack,
      );
      return { locked: false };
    }
  }

  async cleanupExpiredLocks(): Promise<number> {
    const now = new Date();

    try {
      const result = await this.prisma.inventoryLock.deleteMany({
        where: {
          expiresAt: {
            lte: now,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired lock(s)`);
      }

      return result.count;
    } catch (error) {
      this.logger.error(
        `Error cleaning up expired locks: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }
}