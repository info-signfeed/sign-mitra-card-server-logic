import { IsNotEmpty } from "class-validator";

export class CreateLoyaltyPlanDto {
    @IsNotEmpty()
    planName: string;
    @IsNotEmpty()
    actualValue: number;
    @IsNotEmpty()
    denominationValue: number;
    validMonth: number;
    monthlyUnit: number;
    status?: number;
    companyId: number;
    userId: number;
    isOneTimeRedeem: number
}
