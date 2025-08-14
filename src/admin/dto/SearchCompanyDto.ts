import { IsNotEmpty } from 'class-validator';

export class SearchCompanyDto {
    @IsNotEmpty()
    companyId: number;
}