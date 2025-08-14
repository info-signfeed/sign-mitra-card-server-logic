import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
    @IsNotEmpty()
    locationName: string;
    @IsNotEmpty()
    locationAddress1: string;
    @IsNotEmpty()
    locationAddress2: string;
    @IsNotEmpty()
    locationCity: string;
    @IsNotEmpty()
    locationState: string;

    companyId: number;
    @IsNotEmpty()
    isActive: boolean;
}