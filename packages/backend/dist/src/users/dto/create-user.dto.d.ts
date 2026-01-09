import { UserRole } from '../user.entity';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    timezone?: string;
    roles?: UserRole[];
}
