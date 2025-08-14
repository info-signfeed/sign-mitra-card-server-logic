import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('location_master')
export class LocationMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ name: 'location_name', type: 'varchar' })
    locationName: string;
    @Column({ name: 'location_add_1', type: 'varchar' })
    locationAdd1: string;
    @Column({ name: 'location_add_2', type: 'varchar' })
    locationAdd2: string;
    @Column({ name: 'city', type: 'varchar' })
    city: string;
    @Column({ name: 'state', type: 'varchar' })
    state: string;
    @Column({ name: 'company_id', type: 'int' })
    companyId: number;
    @Column({ name: 'is_active', type: 'boolean' })
    isActive: boolean;
    @Column({ name: 'location_url_string', type: 'varchar' })
    locationUrlString: string;


}