import { IsNotEmpty } from 'class-validator';

export class CreateUserRoleDto {
    @IsNotEmpty()
    roleName: string;
    @IsNotEmpty()
    isActive: boolean;

}