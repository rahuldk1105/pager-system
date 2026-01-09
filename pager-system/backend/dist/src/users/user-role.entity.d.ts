import { User, UserRole as UserRoleEnum } from './user.entity';
export declare class UserRoleEntity {
    id: string;
    userId: string;
    role: UserRoleEnum;
    user: User;
    assignedAt: Date;
    assignedBy?: string;
}
