import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { BillItemEntity } from './billItemMasterEntity';

@Entity('bill_master')
export class BillMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_name', type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({ name: 'bill_no', type: 'varchar', length: 100 })
  billNo: string;

  @Column({ name: 'transaction_date', type: 'datetime' })
  transactionDate: Date;

  @Column({ name: 'store_code', type: 'varchar', length: 50 })
  storeCode: string;

  @Column({ name: 'mem_id', type: 'varchar', length: 50 })
  memId: string;

  @Column({ name: 'channel', type: 'varchar', length: 50 })
  channel: string;

  @Column({ name: 'customer_type', type: 'varchar', length: 50 })
  customerType: string;

  @Column({ name: 'bill_value', type: 'decimal', precision: 10, scale: 2 })
  billValue: number;

  @Column({
    name: 'points_redeemed',
    type: 'decimal',
  })
  pointsRedeemed: number;

  @Column({
    name: 'points_value_redeemed',
    type: 'decimal',
  })
  pointsValueRedeemed: number;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode: string;

  @Column({ name: 'vouch_time', type: 'datetime', nullable: true })
  vouchTime: Date;

  @Column({ name: 'vouch_number', type: 'varchar', length: 50, nullable: true })
  vouchNumber: string;

  @Column({
    name: 'discount_coupon_no',
    type: 'varchar',
  })
  discountCouponNo: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => BillItemEntity, (item) => item.billMaster, { cascade: true })
  items: BillItemEntity[];
}
