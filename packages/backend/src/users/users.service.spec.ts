import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserStatus } from './user.entity';
import { UserRoleEntity } from './user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException, BadRequestException } from '../common/exceptions';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  timezone: 'UTC',
  status: UserStatus.ACTIVE,
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
  let service: UsersService;
  let userRepository: Repository<User>;
  let userRoleRepository: Repository<UserRoleEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserRoleEntity),
          useValue: mockUserRoleRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userRoleRepository = module.get<Repository<UserRoleEntity>>(
      getRepositoryToken(UserRoleEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
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
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
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

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      // Mock bcrypt.compare to return true
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.validatePassword(mockUser, 'password123');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      // Mock bcrypt.compare to return false
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      const result = await service.validatePassword(mockUser, 'wrongpassword');

      expect(result).toBe(false);
    });

    it('should return false if password hash is missing', async () => {
      const userWithoutHash = {
        ...mockUser,
        passwordHash: null,
        fullName: 'John Doe',
        hasRole: jest.fn().mockReturnValue(false),
      };

      const result = await service.validatePassword(userWithoutHash, 'password123');

      expect(result).toBe(false);
    });
  });
});