import { IsNotEmpty } from 'class-validator';

export class UpdateStoreMasterDto {
  @IsNotEmpty()
  id: number;
  // storeName: string;

  addressOne: string;
  addressTwo: string;
  city: string;
  state: string;
  country: string;
  companyId: number;
  isActive: boolean;
}
