import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    resetPasswordToken: string;

    @Column()
    resetPasswordExpires: Date

    @Column()
    failedLoginAttempts: number;

    @Column()
    blockedUntil: Date;

    @Column()
    lastFailedLogin: Date;

    @Column()
    password: string;


}