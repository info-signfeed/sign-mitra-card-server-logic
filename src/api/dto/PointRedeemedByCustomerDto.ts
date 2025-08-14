import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class PointRedeemedDto {
  mobileNumber: number;
  cardNumber: number;
  value: number;

  redeemValue: number;
  @IsOptional()
  storeCode: string;
}
