import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
@Entity('user_role_permission')
export class UserRolePermissionEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: 'role_id', type: 'int'})
    roleId: number;
    @Column({name: 'permission_id', type: 'int'})
    permissionId: number;
    @Column({name: 'is_active', type: 'boolean'})
    isActive: boolean;
}