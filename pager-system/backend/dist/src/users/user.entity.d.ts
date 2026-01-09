import { UserRoleEntity } from './user-role.entity';
export declare enum UserRole {
    USER = "user",
    LEAD = "lead",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    timezone: string;
    status: UserStatus;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: UserRoleEntity[];
    get fullName(): string;
    hasRole(role: UserRole): boolean;
}
