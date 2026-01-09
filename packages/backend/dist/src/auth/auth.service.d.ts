import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: string[];
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
    };
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateUser(email: string, password: string): Promise<User | null>;
    private generateTokens;
}
