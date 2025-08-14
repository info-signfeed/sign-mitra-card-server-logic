import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('redeem_transaction')
export class RedeemTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'mobile_number' })
  mobileNumber: number;

  @Column({ type: 'int', name: 'card_number' })
  cardNumber: number;

  @Column({ type: 'int', name: 'redeem_value' })
  redeemValue: number;
  @Column({ type: 'int', name: 'company_id' })
  companyId: number;

  @Column({ type: 'int', name: 'plan_id' })
  planId: number;
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', name: 'status' })
  status: string;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
}
