"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("./users.service");
const user_entity_1 = require("./user.entity");
const user_role_entity_1 = require("./user-role.entity");
const exceptions_1 = require("../common/exceptions");
const mockUser = {
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    timezone: 'UTC',
    status: user_entity_1.UserStatus.ACTIVE,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    fullName: 'John Doe',
    hasRole: jest.fn(),
};
const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
};
const mockUserRoleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};
const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        },
    }),
};
describe('UsersService', () => {
    let service;
    let userRepository;
    let userRoleRepository;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_role_entity_1.UserRoleEntity),
                    useValue: mockUserRoleRepository,
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        userRoleRepository = module.get((0, typeorm_1.getRepositoryToken)(user_role_entity_1.UserRoleEntity));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto = {
                email: 'newuser@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
            };
            const queryRunner = mockDataSource.createQueryRunner();
            queryRunner.manager.findOne.mockResolvedValue(null);
            queryRunner.manager.create.mockReturnValue(mockUser);
            queryRunner.manager.save.mockResolvedValue(mockUser);
            const result = await service.create(createUserDto);
            expect(result).toEqual(mockUser);
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
        });
        it('should throw ConflictException if user already exists', async () => {
            const createUserDto = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
            };
            const queryRunner = mockDataSource.createQueryRunner();
            queryRunner.manager.findOne.mockResolvedValue(mockUser);
            await expect(service.create(createUserDto)).rejects.toThrow(exceptions_1.ConflictException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        });
    });
    describe('findById', () => {
        it('should return a user when found', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.findById('1');
            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['roles'],
            });
        });
        it('should throw NotFoundException when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.findById('999')).rejects.toThrow(exceptions_1.NotFoundException);
        });
    });
    describe('validatePassword', () => {
        it('should return true for valid password', async () => {
            jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
            const result = await service.validatePassword(mockUser, 'password123');
            expect(result).toBe(true);
        });
        it('should return false for invalid password', async () => {
            jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);
            const result = await service.validatePassword(mockUser, 'wrongpassword');
            expect(result).toBe(false);
        });
        it('should return false if password hash is missing', async () => {
            const userWithoutHash = Object.assign(Object.assign({}, mockUser), { passwordHash: null, fullName: 'John Doe', hasRole: jest.fn().mockReturnValue(false) });
            const result = await service.validatePassword(userWithoutHash, 'password123');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map