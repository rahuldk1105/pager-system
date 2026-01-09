import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEntity } from './user-role.entity';

export enum UserRole {
  USER = 'user',
  LEAD = 'lead',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty()
  @Column({ default: 'UTC' })
  timezone: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ type: () => [UserRoleEntity] })
  @OneToMany(() => UserRoleEntity, userRole => userRole.user)
  roles: UserRoleEntity[];

  // Virtual property for full name
  @ApiProperty()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Method to check if user has a specific role
  hasRole(role: UserRole): boolean {
    return this.roles?.some(userRole => userRole.role === role) || false;
  }
}