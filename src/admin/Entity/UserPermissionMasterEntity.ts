import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
@Entity('user_permission_master')
export class UserPermissionMasterEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: 'permission_name', type: 'varchar'})
    permissionName: string;
    @Column({name: 'is_active', type: 'boolean'})
    isActive: boolean;

}