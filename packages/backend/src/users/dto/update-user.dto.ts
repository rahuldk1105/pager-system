import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}