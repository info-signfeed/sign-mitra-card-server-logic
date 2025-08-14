import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_user')
export class AuthUserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_name', type: 'varchar' })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar' })
    lastName: string;

    @Column({ name: 'username', type: 'varchar' })
    username: string;

    @Column({ name: 'password', type: 'varchar' })
    password: string;

    @Column({ name: 'email', type: 'varchar' })
    email: string;

    @Column({ name: 'mobile', type: 'int' })
    mobile: number;

    @Column({ name: 'department', type: 'varchar' })
    department: string;
    // @Column({ name: 'user_type', type: 'varchar' })
    // userType: string;

    @Column({ name: 'user_role', type: 'int' })
    userRole: number;

    @Column({ name: 'created_on', type: 'datetime' })
    createdOn: Date;

    @Column({ name: 'created_by', type: 'varchar' })
    createdBy: string;

    @Column({ name: 'updated_on', type: 'datetime' })
    updatedOn: Date;

    @Column({ name: 'updated_by', type: 'varchar' })
    updatedBy: string;

    @Column({ name: 'is_active', type: 'boolean' })
    isActive: boolean;

    @Column({ name: 'company_id', type: 'int' })
    companyId: number;
}