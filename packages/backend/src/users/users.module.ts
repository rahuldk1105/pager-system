import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { UserRoleEntity } from './user-role.entity';
import { SupabaseConfigService } from '../config/supabase.config';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRoleEntity])],
  controllers: [UsersController],
  providers: [UsersService, SupabaseConfigService],
  exports: [UsersService],
})
export class UsersModule {}