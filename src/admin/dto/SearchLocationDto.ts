import { IsNotEmpty } from 'class-validator';

export class SearchLocationDto {
    @IsNotEmpty()
    locationId: number;
}