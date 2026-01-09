import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles?: string[];
  deviceId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private supabaseConfig: SupabaseConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles || [],
      deviceId: payload.deviceId,
    };
  }

  async validateSupabaseToken(token: string) {
    try {
      const supabase = this.supabaseConfig.getClient();
      const { data, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      return data.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Supabase token');
    }
  }
}