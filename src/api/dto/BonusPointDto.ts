import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddBonusPointDto {
  number: number; // could be mobileNumber or cardNumber
  bonusPoint: number;
  bonusType: string;
  @IsOptional()
  expiryDate: Date;
  // @IsNotEmpty()
  storeCode: string;
}
