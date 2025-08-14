import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateLocationDto {
    @IsNotEmpty()
    locationId: number

    locationName: string;

    locationAddress1: string;

    locationAddress2: string;

    locationCity: string;

    locationState: string;


    companyId: number;

    isActive: boolean;
}