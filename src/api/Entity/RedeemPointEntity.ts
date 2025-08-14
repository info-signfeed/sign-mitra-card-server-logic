import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('purchase_plan_master')
export class RedeemPointEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'customer_name' })
  customerName: string;

  @Column({ type: 'int', name: 'mobile_number' })
  mobileNumber: number;

  @Column({ type: 'int', name: 'card_number' })
  cardNumber: number;

  @Column({ type: 'int', name: 'plan_id' })
  planId: number;
  @Column({ type: 'int', name: 'denomination_value' })
  denominationValue: number;
  @Column({ type: 'date', name: 'valid_till' })
  validTill: Date;
  @Column({ type: 'date', name: 'last_redeem_date' })
  lastRedeemDate: Date;
  @Column({ type: 'int', name: 'valid_month' })
  validMonth: number;
  @Column({ type: 'int', name: 'monthly_limit' })
  monthlyLimit: number;
  @Column({ type: 'int', name: 'redeem_point' })
  redeemPoint: number;
  @Column({ type: 'int', name: 'pending_point' })
  pendingPoint: number;
  @Column({ type: 'int', name: 'spend_point' })
  spendPoint: number;
  @Column({ type: 'int', name: 'amount_pay_cashier' })
  amountPayCashier: number;
  @Column({ type: 'int', name: 'actual_value' })
  actualValue: number;
  @Column({ type: 'int', name: 'customer_id' })
  customerId: number;
  @Column({ type: 'int', name: 'company_id' })
  companyId: number;
  @Column({ type: 'int', name: 'user_id' })
  userId: number;
  @Column({ type: 'varchar', name: 'status' })
  status: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
}
