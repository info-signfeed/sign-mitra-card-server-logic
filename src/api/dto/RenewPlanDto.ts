import { IsString, IsNotEmpty } from 'class-validator';

export class RenewPlanDto {
    @IsString()
    @IsNotEmpty()
    mobileNumber: number;

    @IsString()
    @IsNotEmpty()
    cardNumber: number;

    @IsString()
    @IsNotEmpty()
    planId: number; // ID of the new plan to be applied
}
