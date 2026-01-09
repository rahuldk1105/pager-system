import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { UserRoleEntity } from './user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userRepository;
    private userRoleRepository;
    private dataSource;
    private readonly logger;
    constructor(userRepository: Repository<User>, userRoleRepository: Repository<UserRoleEntity>, dataSource: DataSource);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    validatePassword(user: User, password: string): Promise<boolean>;
    private assignRoles;
}
