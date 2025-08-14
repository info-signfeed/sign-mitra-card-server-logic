import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('bonus_amount_manage')
export class BonusAmountManageMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'phone_number', type: 'bigint' })
  phoneNumber: number;

  @Column({ name: 'card_number', type: 'bigint' })
  cardNumber: number;

  @Column({ name: 'bonus_amount', type: 'int' })
  bonusAmount: number;

  @Column({ name: 'bonus_type', type: 'varchar', length: 50 })
  bonusType: string;

  @Column({ name: 'used_amount', type: 'int' })
  usedAmount: number;

  @Column({ name: 'remaining_amount', type: 'int' })
  remainingAmount: number;

  @Column({ name: 'bonus_date', type: 'datetime' })
  bonusDate: Date;
  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
  @CreateDateColumn({ name: 'expiry_date', type: 'datetime' })
  expiryDate: Date;
  @CreateDateColumn({ name: 'expiry_status', type: 'boolean' })
  expiryStatus: boolean;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
}
