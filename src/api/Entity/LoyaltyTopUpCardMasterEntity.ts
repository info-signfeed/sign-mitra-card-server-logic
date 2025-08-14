import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('loyalty_card_details')
export class LoyaltyCardTopupMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'company_id', type: 'int' })
  companyId: number;
  @Column({ name: 'mobile_number', type: 'int' })
  mobileNumber: number;
  @Column({ name: 'card_number', type: 'int' })
  cardNumber: number;
  @Column({ name: 'card_type', type: 'varchar' })
  cardType: string; // "loyalty"
  @Column({ name: 'shopping_amount', type: 'int' })
  shoppingAmount: number;
  @Column({ name: 'discounted_shopping_value', type: 'int' })
  discountedShoppingValue: number;

  @Column({ name: 'top_up_percent', type: 'int' })
  topupPercent: number;
  @Column({ name: 'top_up_value', type: 'int' })
  topupValue: number;

  @Column({ name: 'current_amount', type: 'int' })
  currentAmount: number;
  @Column({ name: 'valid_till', type: 'date' })
  validTill: Date;
  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createdAt: Date;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
}
