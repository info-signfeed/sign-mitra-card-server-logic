import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export class RegisterCustomerDto {
  @IsNumber()
  mobileNumber: number;

  @IsNumber()
  cardNumber: number;

  @IsString()
  customerName: string;

  // @IsEmail()
  customerEmail: string;

  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsNumber()
  @Type(() => Number)
  cardType: number;
  @IsOptional()
  @IsString()
  birthDate?: string | null; // Expecting a string in the format 'yyyy-mm-dd'

  @IsOptional()
  @IsString()
  anniversaryDate?: string | null;
  @IsOptional()
  @IsNumber()
  planId?: number;
  // userId: number;
  // companyId: number;
  status: boolean;

  @IsBoolean()
  termsAccepted: boolean;
  @IsNotEmpty()
  storeCode: string;
  SecurityToken: string;
}
