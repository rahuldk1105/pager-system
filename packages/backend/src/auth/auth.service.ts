import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SupabaseConfigService } from '../config/supabase.config';
import { User, UserStatus } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuthenticationException, ValidationException } from '../common/exceptions';

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private supabaseConfig: SupabaseConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Validate input
      if (!loginDto.email || !loginDto.password) {
        throw new ValidationException('Email and password are required');
      }

      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        this.logger.warn(`Login attempt for non-existent user: ${loginDto.email}`);
        throw new AuthenticationException('Invalid credentials');
      }

      // Check account status
      if (user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`Login attempt for inactive account: ${user.email}, status: ${user.status}`);
        throw new AuthenticationException('Account is not active');
      }

      // Validate password
      const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${user.email}`);
        throw new AuthenticationException('Invalid credentials');
      }

      // Validate device ID
      if (!loginDto.deviceId || loginDto.deviceId.length < 10) {
        throw new ValidationException('Valid device ID is required');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user, loginDto.deviceId);

      // Log successful login
      this.logger.log(`User logged in: ${user.email}, device: ${loginDto.deviceId}`);

      // Return sanitized response
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles?.map(r => r.role) || [],
        },
        tokens,
      };
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof AuthenticationException || error instanceof ValidationException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error(`Login error for ${loginDto.email}:`, error);
      throw new AuthenticationException('Authentication service temporarily unavailable');
    }
  }

  async signUpWithSupabase(email: string, password: string, userData?: any): Promise<any> {
    try {
      const supabase = this.supabaseConfig.getClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Supabase signup error:', error);
      throw new AuthenticationException('Signup failed');
    }
  }

  async signInWithSupabase(email: string, password: string): Promise<any> {
    try {
      const supabase = this.supabaseConfig.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Supabase signin error:', error);
      throw new AuthenticationException('Invalid credentials');
    }
  }

  async getSupabaseUser(accessToken: string): Promise<any> {
    try {
      const supabase = this.supabaseConfig.getClient();
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error) throw error;
      return data.user;
    } catch (error) {
      this.logger.error('Supabase getUser error:', error);
      throw new AuthenticationException('Invalid token');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.usersService.validatePassword(user, password);
      return isPasswordValid ? user : null;
    } catch (error) {
      this.logger.error(`User validation error for ${email}:`, error);
      return null;
    }
  }

  private async generateTokens(user: User, deviceId: string): Promise<any> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.role) || [],
      deviceId,
    };

    try {
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
      });

      const refreshToken = this.jwtService.sign(
        {
          sub: user.id,
          deviceId,
          tokenVersion: 1, // For future token invalidation
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
        },
      );

      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error(`Token generation error for user ${user.id}:`, error);
      throw new AuthenticationException('Token generation failed');
    }
  }
}

