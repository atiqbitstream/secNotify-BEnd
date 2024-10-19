import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"


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

    // @OneToOne(()=>Password2fa,(password2fa)=>password2fa.account)
    // @JoinColumn()
    // password2fa:Password2fa;

}