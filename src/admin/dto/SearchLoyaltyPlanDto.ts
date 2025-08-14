import { IsNotEmpty } from 'class-validator';

export class SearchLoyaltyPlanDto {
    @IsNotEmpty()
    planId: number;
}