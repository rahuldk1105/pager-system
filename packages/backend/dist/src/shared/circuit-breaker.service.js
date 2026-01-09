"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor() {
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.breakers = new Map();
        this.defaultOptions = {
            failureThreshold: 5,
            recoveryTimeout: 60000,
            monitoringPeriod: 300000,
        };
    }
    async execute(serviceName, operation, options = {}) {
        const config = Object.assign(Object.assign({}, this.defaultOptions), options);
        const state = this.getOrCreateBreaker(serviceName, config);
        if (state.status === 'OPEN') {
            if (Date.now() - state.lastFailureTime < config.recoveryTimeout) {
                throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
            }
            state.status = 'HALF_OPEN';
            this.logger.log(`Circuit breaker HALF_OPEN for service: ${serviceName}`);
        }
        try {
            const result = await operation();
            this.recordSuccess(serviceName, state);
            return result;
        }
        catch (error) {
            this.recordFailure(serviceName, state, config);
            throw error;
        }
    }
    getOrCreateBreaker(serviceName, config) {
        if (!this.breakers.has(serviceName)) {
            this.breakers.set(serviceName, {
                status: 'CLOSED',
                failureCount: 0,
                lastFailureTime: 0,
                successCount: 0,
            });
        }
        return this.breakers.get(serviceName);
    }
    recordSuccess(serviceName, state) {
        state.failureCount = 0;
        state.successCount++;
        if (state.status === 'HALF_OPEN') {
            state.status = 'CLOSED';
            this.logger.log(`Circuit breaker CLOSED for service: ${serviceName}`);
        }
    }
    recordFailure(serviceName, state, config) {
        state.failureCount++;
        state.lastFailureTime = Date.now();
        if (state.failureCount >= config.failureThreshold) {
            state.status = 'OPEN';
            this.logger.warn(`Circuit breaker OPEN for service: ${serviceName} (${state.failureCount} failures)`);
        }
    }
    getBreakerStatus(serviceName) {
        return this.breakers.get(serviceName) || null;
    }
    resetBreaker(serviceName) {
        const state = this.breakers.get(serviceName);
        if (state) {
            state.status = 'CLOSED';
            state.failureCount = 0;
            state.successCount = 0;
            state.lastFailureTime = 0;
            this.logger.log(`Circuit breaker reset for service: ${serviceName}`);
        }
    }
    getAllBreakerStatuses() {
        const result = {};
        for (const [serviceName, state] of this.breakers.entries()) {
            result[serviceName] = Object.assign({}, state);
        }
        return result;
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map