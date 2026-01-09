export interface CircuitBreakerOptions {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
}
export declare class CircuitBreakerService {
    private readonly logger;
    private breakers;
    private readonly defaultOptions;
    execute<T>(serviceName: string, operation: () => Promise<T>, options?: Partial<CircuitBreakerOptions>): Promise<T>;
    private getOrCreateBreaker;
    private recordSuccess;
    private recordFailure;
    getBreakerStatus(serviceName: string): CircuitBreakerState | null;
    resetBreaker(serviceName: string): void;
    getAllBreakerStatuses(): Record<string, CircuitBreakerState>;
}
export interface CircuitBreakerState {
    status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    lastFailureTime: number;
    successCount: number;
}
