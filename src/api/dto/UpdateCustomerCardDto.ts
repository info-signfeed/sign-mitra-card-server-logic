import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCustomerCardDto {
  @IsNotEmpty()
  customerId: number;
  newCardNumber: number;
}
