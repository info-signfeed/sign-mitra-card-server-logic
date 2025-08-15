import { IsInt, IsNotEmpty } from 'class-validator';

export class RedeemedTransactionDto {
  @IsInt()
  mobileNumber: number;

  @IsInt()
  cardNumber: number;

  @IsNotEmpty()
  @IsInt()
  redeemValue: number;
  // @IsNotEmpty()
  storeCode: string;
}
