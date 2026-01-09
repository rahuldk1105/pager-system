import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../user.entity';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    password?: string;
    status?: UserStatus;
}
export {};
