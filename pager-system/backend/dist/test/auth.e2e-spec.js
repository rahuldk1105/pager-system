"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("./../src/app.module");
describe('AuthController (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    it('/api/auth/login (POST) - should return 401 for invalid credentials', () => {
        return request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
            email: 'invalid@example.com',
            password: 'wrongpassword',
        })
            .expect(401);
    });
    it('/api/health (GET) - should return health status', () => {
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
//# sourceMappingURL=auth.e2e-spec.js.map