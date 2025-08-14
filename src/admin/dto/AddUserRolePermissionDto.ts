import { IsNotEmpty } from 'class-validator';

export class AddUserRolePermissionDto {
    @IsNotEmpty()
    roleId: number;
    @IsNotEmpty()
    permissionId: number;
    @IsNotEmpty()
    isActive: boolean;

}