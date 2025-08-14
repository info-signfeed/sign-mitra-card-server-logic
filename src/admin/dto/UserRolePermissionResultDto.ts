import { IsNotEmpty } from 'class-validator';

export class UserRolePermissionResultDto {
    permissionId: number;
    permissionName:string;
    isActive: boolean
}