import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plan_master' })
export class LoyaltyPlanMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ name: 'plan_name', type: 'varchar', length: 100, nullable: true })
    planName: string;
    @Column({ name: "actual_value", type: 'decimal', precision: 10, scale: 2, nullable: true })
    actualValue: number;
    @Column({ name: "denomination_value", type: 'decimal', precision: 10, scale: 2, nullable: true })
    denominationValue: number;
    @Column({ name: "valid_month", type: 'int', nullable: true })
    validMonth: number;
    @Column({ name: "monthly_unit", type: 'int' })
    monthlyUnit: number;
    @Column({ name: "status", type: 'tinyint', default: 1 })
    status: number;
    @Column({ name: "company_id", type: 'int', nullable: true })
    companyId: number;
    @Column({ name: "is_one_time_redeem", type: 'tinyint', default: false })
    isOneTimeRedeem: number;
    @Column({ name: "user_id", type: 'int', nullable: true })
    userId: number;
}
