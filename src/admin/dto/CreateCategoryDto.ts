import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    categoryName: string;
    description: string;
    pid: number[] | string;
    status: boolean;
    mediaUrl: string;
    userId: number;
    companyId: number;
}
