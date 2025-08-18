import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'reward_action_history' })
export class RewardActionHistoryMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @Column({ name: 'mobile_number', type: 'varchar' })
  mobileNumber: string;

  @Column({ name: 'card_number', type: 'varchar' })
  cardNumber: string;

  @Column({ name: 'action_name', type: 'varchar' })
  actionName: string;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
