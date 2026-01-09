"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./user.entity");
const user_role_entity_1 = require("./user-role.entity");
const exceptions_1 = require("../common/exceptions");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository, userRoleRepository, dataSource) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingUser = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                throw new exceptions_1.ConflictException('User with this email already exists');
            }
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
            const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);
            const user = queryRunner.manager.create(user_entity_1.User, {
                email: createUserDto.email,
                passwordHash,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                phone: createUserDto.phone,
                timezone: createUserDto.timezone || 'UTC',
            });
            const savedUser = await queryRunner.manager.save(user_entity_1.User, user);
            if (createUserDto.roles && createUserDto.roles.length > 0) {
                await this.assignRoles(queryRunner, savedUser.id, createUserDto.roles);
            }
            await queryRunner.commitTransaction();
            this.logger.log(`User created: ${savedUser.email} (${savedUser.id})`);
            return savedUser;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create user ${createUserDto.email}:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        try {
            return await this.userRepository.find({
                relations: ['roles'],
                where: { status: user_entity_1.UserStatus.ACTIVE },
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error('Failed to fetch users:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['roles'],
            });
            if (!user) {
                throw new exceptions_1.NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to find user ${id}:`, error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            return await this.userRepository.findOne({
                where: { email },
                relations: ['roles'],
            });
        }
        catch (error) {
            this.logger.error(`Failed to find user by email ${email}:`, error);
            return null;
        }
    }
    async update(id, updateUserDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { id },
                relations: ['roles'],
            });
            if (!user) {
                throw new exceptions_1.NotFoundException(`User with ID ${id} not found`);
            }
            Object.assign(user, updateUserDto);
            if (updateUserDto.password) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
                user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
            }
            const updatedUser = await queryRunner.manager.save(user_entity_1.User, user);
            await queryRunner.commitTransaction();
            this.logger.log(`User updated: ${updatedUser.email} (${updatedUser.id})`);
            return updatedUser;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to update user ${id}:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        try {
            const user = await this.findById(id);
            user.status = user_entity_1.UserStatus.INACTIVE;
            await this.userRepository.save(user);
            this.logger.log(`User deactivated: ${user.email} (${user.id})`);
        }
        catch (error) {
            this.logger.error(`Failed to remove user ${id}:`, error);
            throw error;
        }
    }
    async validatePassword(user, password) {
        try {
            if (!user.passwordHash) {
                return false;
            }
            return await bcrypt.compare(password, user.passwordHash);
        }
        catch (error) {
            this.logger.error(`Password validation error for user ${user.id}:`, error);
            return false;
        }
    }
    async assignRoles(queryRunner, userId, roles) {
        await queryRunner.manager.delete(user_role_entity_1.UserRoleEntity, { userId });
        const roleEntities = roles.map(role => queryRunner.manager.create(user_role_entity_1.UserRoleEntity, {
            userId,
            role,
        }));
        await queryRunner.manager.save(user_role_entity_1.UserRoleEntity, roleEntities);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRoleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], UsersService);
//# sourceMappingURL=users.service.js.map