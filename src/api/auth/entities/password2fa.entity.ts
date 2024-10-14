import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./user.entity"

@Entity()
export class Password2fa {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    verificationCode: string

    @Column()
    newPasswordHash: string

    @ManyToOne(()=>User,user=>user.password2fa)
    user:User

}