import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('top_up_record')
export class TopUpDataMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'card_number', type: 'bigint', nullable: true })
  cardNumber: number;

  @Column({ name: 'mobile_number', type: 'bigint', nullable: true })
  mobileNumber: number;

  @Column({ name: 'topup_value', type: 'int' })
  topupValue: number;

  @Column({ name: 'current_point', type: 'int' })
  currentPoint: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
