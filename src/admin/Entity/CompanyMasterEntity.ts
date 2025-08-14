import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
@Entity('company_master')
export class CompanyMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: 'company_name', type: 'varchar'})
    companyName: string;
    @Column({name: 'address_1', type: 'varchar'})
    address1: string;
    @Column({name: 'address_2', type: 'varchar'})
    address2: string;
    @Column({name: 'city', type: 'varchar'})
    city: string;
    @Column({name: 'state', type: 'varchar'})
    state: string;
    @Column({name: 'is_active', type: 'boolean'})
    isActive: boolean;
    @Column({name: 'company_url_string', type: 'varchar'})
    companyUrlString: string;
    @Column({name: 'company_logo', type: 'varchar'})
    companyLogo: string;

}