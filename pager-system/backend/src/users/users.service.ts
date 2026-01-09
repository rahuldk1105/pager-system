import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus, UserRole as UserRoleEnum } from './user.entity';
import { UserRoleEntity } from './user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConflictException, NotFoundException } from '../common/exceptions';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user
      const user = queryRunner.manager.create(User, {
        email: createUserDto.email,
        passwordHash,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        timezone: createUserDto.timezone || 'UTC',
      });

      const savedUser = await queryRunner.manager.save(User, user);

      // Assign roles if specified
      if (createUserDto.roles && createUserDto.roles.length > 0) {
        await this.assignRoles(queryRunner, savedUser.id, createUserDto.roles);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`User created: ${savedUser.email} (${savedUser.id})`);
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create user ${createUserDto.email}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['roles'],
        where: { status: UserStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch users:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email ${email}:`, error);
      return null;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id },
        relations: ['roles'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Update fields
      Object.assign(user, updateUserDto);

      // Hash new password if provided
      if (updateUserDto.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
        user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      }

      const updatedUser = await queryRunner.manager.save(User, user);
      await queryRunner.commitTransaction();

      this.logger.log(`User updated: ${updatedUser.email} (${updatedUser.id})`);
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update user ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.findById(id);

      // Soft delete by setting status to inactive
      user.status = UserStatus.INACTIVE;
      await this.userRepository.save(user);

      this.logger.log(`User deactivated: ${user.email} (${user.id})`);
    } catch (error) {
      this.logger.error(`Failed to remove user ${id}:`, error);
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      if (!user.passwordHash) {
        return false;
      }
      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      this.logger.error(`Password validation error for user ${user.id}:`, error);
      return false;
    }
  }

  private async assignRoles(
    queryRunner: any,
    userId: string,
    roles: UserRoleEnum[]
  ): Promise<void> {
    // Remove existing roles
    await queryRunner.manager.delete(UserRoleEntity, { userId });

    // Assign new roles
    const roleEntities = roles.map(role =>
      queryRunner.manager.create(UserRoleEntity, {
        userId,
        role,
      })
    );

    await queryRunner.manager.save(UserRoleEntity, roleEntities);
  }
}