"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const health_module_1 = require("../src/health/health.module");
describe('Health (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [health_module_1.HealthModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });
    it('/api/health (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/health')
            .expect(200)
            .expect((res) => {
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('pager-api');
        });
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=health.e2e-spec.js.map