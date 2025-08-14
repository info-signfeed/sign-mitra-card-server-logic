import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    id: number;

    firstName: string;

    lastName: string;

    userName: string;

    userPassword: string;

    userEmail: string;

    userMobile: number;

    // userType: string;

    userDepartment: string;

    userRole: number;

    companyId: number;

    isActive: boolean;

}