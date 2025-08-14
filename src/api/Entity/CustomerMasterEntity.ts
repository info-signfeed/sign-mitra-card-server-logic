import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('register_customer')
export class RegisterCustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'mobile_number' })
  mobileNumber: number;

  @Column({ type: 'bigint', name: 'card_number' })
  cardNumber: number;

  @Column({ type: 'varchar', name: 'customer_name' })
  customerName: string;

  @Column({ type: 'varchar', name: 'customer_email' })
  customerEmail: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], name: 'gender' })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'varchar', nullable: true, name: 'birth_date' })
  birthDate: string | null;

  @Column({ type: 'int', nullable: true, name: 'card_type' })
  cardType: number | null;
  @Column({ type: 'varchar', nullable: true, name: 'anniversary_date' })
  anniversaryDate: string | null;

  @Column({ type: 'int', nullable: true, name: 'plan_id' })
  planId: number;

  @Column({ type: 'boolean', name: 'term_accepted' })
  termsAccepted: boolean;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: boolean;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;
  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'date' })
  updatedAt: Date;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
}
