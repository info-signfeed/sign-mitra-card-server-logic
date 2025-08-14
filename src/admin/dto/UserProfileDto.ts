import { IsNotEmpty } from 'class-validator';
import { UserRolePermissionResultDto } from "./UserRolePermissionResultDto";

export class UserProfileDto {
    @IsNotEmpty()
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile: number;
    department: string;
    userRole: number;
    location: LocationDto[];
    company: CompanyDto[];
    permission: PermissionDto[];

}
export class LocationDto {
    @IsNotEmpty()
    locationId: number;
    locationName: string;

}

export class CompanyDto {
    @IsNotEmpty()
    companyId: number;
    companyName: string;
}


export class PermissionDto {
    @IsNotEmpty()
    permissionId: number;
    permissionName: string;
}