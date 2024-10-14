import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm"
import { Account } from "./account.entity"

@Entity()
export class Password2fa {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    verificationCode: string

    @Column()
    newPasswordHash: string

    @OneToOne(()=>Account, (account)=>account.password2fa)
    account:Account;



}