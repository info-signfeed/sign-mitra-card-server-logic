import { IsNotEmpty } from 'class-validator';

export class SearchCustomerDto {
    @IsNotEmpty()
    id: number;
    mobileNumber: number;
    cardNumber: number;
    customerName: string;
    customerEmail: string;
    gender: string;
    birthDate?: string | null;  // Expecting a string in the format 'yyyy-mm-dd'
    anniversaryDate?: string | null;
    planId?: number;
    userId: number;
    companyId: number
    status: boolean
    termsAccepted: boolean;
}