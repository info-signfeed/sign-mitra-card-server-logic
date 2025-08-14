import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'company_sms_template' })
export class CompanySmsTemplateEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'company_id', type: 'int' })
    companyId: number;
    @Column({ name: 'company_name', type: 'varchar' })
    companyName: string;
    @Column({ name: 'template_key', type: 'varchar' })
    templateKey: string; // e.g., 'register-customer', 'shopping', etc.
    @Column({ name: 'template_id', type: 'varchar' })
    templateId: string;
    @Column({ name: 'template_text', type: 'text' })
    templateText: string; // e.g., "Hi from {companyName}, thank you for registering. You have {pendingPoint} points."


    @Column({ name: 'created_at', type: 'varchar' })
    createdAt: string;



}
