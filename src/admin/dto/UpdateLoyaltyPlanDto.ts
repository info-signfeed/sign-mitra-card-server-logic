import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateLoyaltyPlanDto {
    @IsNotEmpty()
    planId: number


    planName: string;

    actualValue: number;

    denominationValue: number;
    validMonth: number;
    monthlyUnit: number;
    status?: number;
    isOneTimeRedeem: number


}