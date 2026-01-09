export declare class HealthController {
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
    }>;
    readinessCheck(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: string;
        };
    }>;
}
