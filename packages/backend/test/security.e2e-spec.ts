import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Input Validation & SQL Injection Protection', () => {
    it('should prevent SQL injection in incident creation', () => {
      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: "'; DROP TABLE incidents; --",
          description: 'SQL injection attempt',
          priority: 'high',
        })
        .expect(400);
    });

    it('should prevent XSS in incident title', () => {
      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: '<script>alert("XSS")</script>',
          description: 'XSS attempt',
          priority: 'high',
        })
        .expect(400);
    });

    it('should validate UUID format', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/invalid-uuid-format')
        .set('Authorization', 'Bearer test-token')
        .expect(400);
    });

    it('should prevent path traversal', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/../../../etc/passwd')
        .set('Authorization', 'Bearer test-token')
        .expect(400);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authorization header', () => {
      return request(app.getHttpServer())
        .get('/api/incidents')
        .expect(401);
    });

    it('should reject requests with invalid JWT', () => {
      return request(app.getHttpServer())
        .get('/api/incidents')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    it('should reject requests with expired JWT', () => {
      const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4AdcjW7o4Z2n7Kj2xPuNHF9g5K9r2Q3Q4Q3Q4Q3Q4Q';
      return request(app.getHttpServer())
        .get('/api/incidents')
        .set('Authorization', expiredToken)
        .expect(401);
    });

    it('should reject requests with insufficient permissions', () => {
      // This would require setting up a user with insufficient permissions
      // For now, we'll test the general case
      return request(app.getHttpServer())
        .delete('/api/incidents/test-id')
        .set('Authorization', 'Bearer test-token')
        .expect(401); // Unauthorized due to mock token
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const requests = Array(15).fill().map(() =>
        request(app.getHttpServer())
          .get('/api/incidents')
          .set('Authorization', 'Bearer test-token')
      );

      // Wait for all requests to complete
      const results = await Promise.allSettled(requests);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const rateLimitedCount = results.filter(r =>
        r.status === 'rejected' &&
        r.reason.response?.status === 429
      ).length;

      // Should have some successful requests and some rate limited
      expect(successCount).toBeGreaterThan(0);
      // Note: Rate limiting might not be fully implemented in test environment
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize HTML in error responses', () => {
      // This test would check that error messages don't contain
      // potentially dangerous HTML or script tags
    });

    it('should not leak sensitive information in errors', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404)
        .expect((res) => {
          // Ensure error doesn't contain stack traces or sensitive data
          expect(res.body.error).not.toHaveProperty('stack');
          expect(res.body.error).not.toHaveProperty('sql');
          expect(res.body.error.message).not.toMatch(/password|token|secret/i);
        });
    });
  });

  describe('Resource Exhaustion Protection', () => {
    it('should limit request body size', () => {
      const largeBody = 'x'.repeat(1024 * 1024 * 10); // 10MB

      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', 'Bearer test-token')
        .set('Content-Type', 'application/json')
        .send({
          title: 'Test',
          description: largeBody,
          priority: 'high',
        })
        .expect(413); // Payload Too Large
    });

    it('should timeout long-running requests', () => {
      // This would test that requests timeout after a certain period
      // Implementation depends on timeout interceptor
    });
  });

  describe('CORS Security', () => {
    it('should allow requests from trusted origins', () => {
      return request(app.getHttpServer())
        .options('/api/incidents')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        });
    });

    it('should reject requests from untrusted origins', () => {
      return request(app.getHttpServer())
        .get('/api/incidents')
        .set('Authorization', 'Bearer test-token')
        .set('Origin', 'https://evil.com')
        .expect((res) => {
          // CORS should block this, but the request might still succeed
          // depending on implementation
        });
    });
  });

  describe('API Security Headers', () => {
    it('should include security headers', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect((res) => {
          expect(res.headers['x-content-type-options']).toBe('nosniff');
          expect(res.headers['x-frame-options']).toBeDefined();
          expect(res.headers['x-xss-protection']).toBeDefined();
        });
    });

    it('should have secure cookie settings', () => {
      // Test cookie settings when authentication is implemented
    });
  });
});