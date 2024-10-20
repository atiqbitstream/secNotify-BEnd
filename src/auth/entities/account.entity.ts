
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"


@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    resetPasswordToken: string;

    @Column({nullable:true})
    resetPasswordExpires: Date

    @Column({nullable:true})
    failedLoginAttempts: number;

    @Column({nullable:true})
    blockedUntil: Date;

    @Column({nullable:true})
    lastFailedLogin: Date;

    @Column()
    password: string;

    @OneToOne(()=>User,(user)=>user.account)
    user:User;

    // @OneToOne(()=>Password2fa,(password2fa)=>password2fa.account)
    // @JoinColumn()
    // password2fa:Password2fa;

}

