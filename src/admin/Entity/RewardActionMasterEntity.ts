import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reward_action_master')
export class RewardActionMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'action_name', type: 'varchar', length: 100 })
  actionName: string;

  @Column({ name: 'default_points', type: 'int', nullable: true })
  defaultPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
