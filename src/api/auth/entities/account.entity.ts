
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { User } from "./user.entity";

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

    @OneToOne(()=>User,user=>user.account)
    user:User


}