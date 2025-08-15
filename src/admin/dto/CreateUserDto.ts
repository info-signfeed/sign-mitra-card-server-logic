import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  userName: string;
  @IsNotEmpty()
  userPassword: string;
  @IsNotEmpty()
  userEmail: string;
  @IsNotEmpty()
  userMobile: number;
  @IsNotEmpty()
  userDepartment: string;
  @IsNotEmpty()
  userRole: number;
  // @IsNotEmpty()
  storeCode: string;

  // userType: string;
  @IsNotEmpty()
  isActive: boolean;
  @IsNotEmpty()
  companyId: number;
}
