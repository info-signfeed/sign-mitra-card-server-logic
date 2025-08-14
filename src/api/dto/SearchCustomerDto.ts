import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SearchCustomerDto {
  @IsOptional()
  @IsNumber()
  number?: number;
  @IsNotEmpty()
  storeCode: string;
  SecurityToken: string;
  // @IsOptional()
  // @IsNumber()
  // cardNumber?: number;
}
