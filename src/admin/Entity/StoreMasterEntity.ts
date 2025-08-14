import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('store_master')
export class StoreMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'store_name', type: 'varchar' })
  storeName: string;
  @Column({ name: 'address_one', type: 'varchar' })
  addressOne: string;
  @Column({ name: 'address_two', type: 'varchar' })
  addressTwo: string;
  @Column({ name: 'city', type: 'varchar' })
  city: string;
  @Column({ name: 'state', type: 'varchar' })
  state: string;
  @Column({ name: 'country', type: 'varchar' })
  country: string;
  @Column({ name: 'store_code', type: 'varchar' })
  storeCode: string;
  @Column({ name: 'status', type: 'boolean', default: true })
  isActive: boolean;
  @Column({ name: 'company_id', type: 'int' })
  companyId: number;
  @Column({ name: 'created_at', type: 'bigint' })
  createdAt: number;
  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;
}
