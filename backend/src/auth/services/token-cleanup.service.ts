import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RefreshToken } from '../refresh-token.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class TokenCleanupService {
  constructor(
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: Logger,
  ) {
    this.scheduleCleanup();
  }

  private scheduleCleanup() {
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    const timeout = setInterval(() => this.cleanupTokens(), cleanupInterval);
    this.schedulerRegistry.addTimeout('tokenCleanup', timeout);
    this.logger.log('Scheduled token cleanup every 24 hours');
  }

  private async cleanupTokens() {
    this.logger.log('Starting token cleanup process');
    try {
      const result = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });
      this.logger.log(`Deleted ${result.affected} expired tokens`);
    } catch (error) {
      this.logger.error('Error during token cleanup', error.stack);
    }
  }
}
