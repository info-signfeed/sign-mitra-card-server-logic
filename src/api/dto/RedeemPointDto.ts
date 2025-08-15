import { IsNotEmpty } from 'class-validator';

export class CreateRedeemPointDto {
  customerName: string;
  mobileNumber: number;
  cardNumber: number;
  planId: number;
  denominationValue: number;
  actualValue: number;
  pendingPoint: number;
  amountPayCashier: number;
  validTill: Date;
  validMonth: number;
  spendPoint: number;
  monthlyLimit: number;
  companyId: number;
  redeemPoint: number;
  lastRedeemDate: Date;
  userId: number;
  // @IsNotEmpty()
  storeCode: string;
}
