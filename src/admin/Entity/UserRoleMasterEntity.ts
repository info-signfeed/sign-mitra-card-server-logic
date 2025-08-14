import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
@Entity('user_role_master')
export class UserRoleMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: 'role_name', type: 'varchar'})
    roleName: string;
    @Column({name: 'is_active', type: 'boolean'})
    isActive: boolean;

}