import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { Password2fa } from "./password2fa.entity";

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

    @OneToOne(()=>User,(user)=>user.account)
    user:User;

    @OneToOne(()=>Password2fa,(passowrd2fa)=>passowrd2fa.account)
    password2fa:Password2fa;

}