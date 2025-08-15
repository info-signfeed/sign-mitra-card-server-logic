import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BillMasterEntity } from './billMasterEntity';

@Entity('bill_items')
export class BillItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BillMasterEntity, (master) => master.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bill_master_id' })
  billMaster: BillMasterEntity;

  @Column({ name: 'item_type', type: 'varchar', length: 50 })
  itemType: string;

  @Column({ name: 'item_qty', type: 'int' })
  itemQty: number;

  @Column({ name: 'unit', type: 'decimal', precision: 10, scale: 2 })
  unit: number;

  @Column({ name: 'item_discount', type: 'decimal', precision: 10, scale: 2 })
  itemDiscount: number;

  @Column({ name: 'item_tax', type: 'decimal', precision: 10, scale: 2 })
  itemTax: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'billed_price', type: 'decimal', precision: 10, scale: 2 })
  billedPrice: number;

  @Column({ name: 'department', type: 'varchar', length: 100 })
  department: string;

  @Column({ name: 'group', type: 'varchar', length: 100 })
  group: string;

  @Column({ name: 'category', type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'item_id', type: 'varchar', length: 50 })
  itemId: string;
}
