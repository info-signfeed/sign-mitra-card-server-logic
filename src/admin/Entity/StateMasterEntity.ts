import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
@Entity('state_master')
export class StateMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: 'state_name', type: 'varchar'})
    stateName: string;
    @Column({name: 'is_active', type: 'int'})
    isActive: number;

}