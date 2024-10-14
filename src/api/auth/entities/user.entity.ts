import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm"
import { Account } from "./account.entity"
import { Password2fa } from "./password2fa.entity"
import { Token } from "./token.entity"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email:string

    @Column()
    phoneNumber:string;

    @Column()
    jobTitle:string

    @Column()
    role:string;

    @Column()
    status:string;

    @Column()
    isTest:boolean;

    @Column()
    preferredTimezone:string;

    @Column()
    vehicleTypes:string;

    @Column()
    canReceiveSms:boolean;

    @OneToOne(()=>Account,account=>account.user)
    account:Account;

    @OneToMany(()=>Password2fa,password2fa=>password2fa.user)
    password2fa:Password2fa[]

    @OneToMany(()=>Token,token=>token.user)
    tokens:Token[]

}