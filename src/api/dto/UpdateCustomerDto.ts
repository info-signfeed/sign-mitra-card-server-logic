import {
    IsOptional,
    IsNotEmpty,
} from 'class-validator';

export class UpdateCustomerDto {
    @IsNotEmpty()
    customerId: number;
    mobileNumber: number;
    cardNumber: number;
    customerName: string;
    customerEmail: string;
    gender: 'male' | 'female' | 'other';
    @IsOptional()
    birthDate?: string | null;
    @IsOptional()
    anniversaryDate?: string | null;
    @IsOptional()
    planId?: number;
    userId: number;
    companyId: number;
    status: boolean;
    termsAccepted: boolean;
}
