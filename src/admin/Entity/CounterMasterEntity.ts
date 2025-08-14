import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('counter_master')
export class CounterMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ name: 'counter_code', type: 'varchar' })
    counterCode: string;
    @Column({ name: 'description', type: 'varchar' })
    description: string;
    @Column({ name: 'location_id', type: 'int' })
    locationId: number;
    @Column({ name: 'company_id', type: 'int' })
    companyId: number;
    @Column({ name: 'is_active', type: 'boolean' })
    isActive: boolean;

}