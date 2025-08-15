import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RewardActionMasterEntity } from './RewardActionMasterEntity';

@Entity('company_reward_action')
export class CompanyRewardActionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @ManyToOne(() => RewardActionMasterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' }) // ✅ Correct FK name
  action: RewardActionMasterEntity;

  @Column({ name: 'points', type: 'int' })
  points: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
