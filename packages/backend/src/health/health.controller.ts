import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pager-api',
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readinessCheck() {
    // In a real implementation, this would check database connectivity
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy',
      },
    };
  }
}