import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class TierDto {
    @IsNotEmpty()
    fromAmount: number;

    @IsNotEmpty()
    toAmount: number;
    validity: number

    @IsNotEmpty()
    topupPercent: number;
}

export class CreateCompanyTierDto {
    // @IsNotEmpty()

    companyId: number;


    @ValidateNested({ each: true })
    @Type(() => TierDto)
    tiers: TierDto[];
}
