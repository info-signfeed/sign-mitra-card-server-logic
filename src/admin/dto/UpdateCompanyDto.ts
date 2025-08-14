import { IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto {
    @IsNotEmpty()
    companyId: number;
    @IsNotEmpty()
    companyName: string;
    @IsNotEmpty()
    companyAddress1: string;
    companyAddress2: string;
    @IsNotEmpty()
    companyCity: string;
    @IsNotEmpty()
    companyState: string;
    @IsNotEmpty()
    isActive: boolean;
}