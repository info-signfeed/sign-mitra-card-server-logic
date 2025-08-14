import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('company_tier_master')
export class CompanyTierMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "company_id", type: "int" })
    companyId: number;

    @Column({ name: "from_amount", type: "int", })
    fromAmount: number;

    @Column({ name: "to_amount", type: "int" })
    toAmount: number;

    @Column({ name: "topup_percent", type: "int" })
    topupPercent: number;

    @Column({ name: "validity", type: "int" })
    validity: number;
    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;


}
