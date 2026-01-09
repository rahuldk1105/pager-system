import { Injectable, Logger } from '@nestjs/common';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, CircuitBreakerState>();

  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
  };

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    options: Partial<CircuitBreakerOptions> = {},
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const state = this.getOrCreateBreaker(serviceName, config);

    if (state.status === 'OPEN') {
      if (Date.now() - state.lastFailureTime < config.recoveryTimeout) {
        throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
      }
      // Try half-open
      state.status = 'HALF_OPEN';
      this.logger.log(`Circuit breaker HALF_OPEN for service: ${serviceName}`);
    }

    try {
      const result = await operation();
      this.recordSuccess(serviceName, state);
      return result;
    } catch (error) {
      this.recordFailure(serviceName, state, config);
      throw error;
    }
  }

  private getOrCreateBreaker(serviceName: string, config: CircuitBreakerOptions): CircuitBreakerState {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, {
        status: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
      });
    }
    return this.breakers.get(serviceName)!;
  }

  private recordSuccess(serviceName: string, state: CircuitBreakerState) {
    state.failureCount = 0;
    state.successCount++;

    if (state.status === 'HALF_OPEN') {
      state.status = 'CLOSED';
      this.logger.log(`Circuit breaker CLOSED for service: ${serviceName}`);
    }
  }

  private recordFailure(serviceName: string, state: CircuitBreakerState, config: CircuitBreakerOptions) {
    state.failureCount++;
    state.lastFailureTime = Date.now();

    if (state.failureCount >= config.failureThreshold) {
      state.status = 'OPEN';
      this.logger.warn(`Circuit breaker OPEN for service: ${serviceName} (${state.failureCount} failures)`);
    }
  }

  getBreakerStatus(serviceName: string): CircuitBreakerState | null {
    return this.breakers.get(serviceName) || null;
  }

  resetBreaker(serviceName: string) {
    const state = this.breakers.get(serviceName);
    if (state) {
      state.status = 'CLOSED';
      state.failureCount = 0;
      state.successCount = 0;
      state.lastFailureTime = 0;
      this.logger.log(`Circuit breaker reset for service: ${serviceName}`);
    }
  }

  getAllBreakerStatuses(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    for (const [serviceName, state] of this.breakers.entries()) {
      result[serviceName] = { ...state };
    }
    return result;
  }
}

export interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}