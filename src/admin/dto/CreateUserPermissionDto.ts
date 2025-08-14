import { IsNotEmpty } from 'class-validator';

export class CreateUserPermissionDto {
    @IsNotEmpty()
    permissionName: string;
    @IsNotEmpty()
    isActive: boolean;

}