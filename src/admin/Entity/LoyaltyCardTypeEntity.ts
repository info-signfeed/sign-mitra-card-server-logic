import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('card_type_master')
export class LoyaltyCardTypeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", name: "card_type" })
    cardType: string;
    @Column({ name: "is_active", type: 'tinyint', default: 1 })
    isActive: boolean;


}
