import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateSoapAuthUserDto {
  @IsOptional()
  @IsString()
  storeCode?: string;

  @IsOptional()
  @IsString()
  username?: string;
  password: string;
  @IsOptional()
  @IsString()
  mobileNo?: string;

  @IsOptional()
  @IsEmail()
  emailId?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  pinCode?: string;

  @IsOptional()
  @IsDateString()
  anniversaryDate?: string;

  @IsOptional()
  @IsString()
  memberShipCardNumber?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  customerTypeCode?: string;

  @IsOptional()
  @IsDateString()
  createdOn?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsDateString()
  updatedOn?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  companyId?: number;
}
