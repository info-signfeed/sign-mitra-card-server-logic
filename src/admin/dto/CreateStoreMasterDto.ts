import { IsNotEmpty } from 'class-validator';

export class CreateStoreMasterDto {
  @IsNotEmpty()
  storeName: string;
  @IsNotEmpty()
  addressOne: string;
  addressTwo: string;
  city: string;
  state: string;
  country: string;
  storeCode: string;
  companyId: number;
  isActive: boolean;
}
