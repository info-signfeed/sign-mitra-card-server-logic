import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateSmsTemplateDto {
    @IsInt()
    companyId: number;
    @IsNotEmpty()
    companyName: string;
    @IsNotEmpty()
    templateType: string;
    @IsNotEmpty()
    templateMessage: string;
    @IsInt()
    userId: number;
}
