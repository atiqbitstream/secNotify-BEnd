import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./user.entity";

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token: string

    @Column()
    expirationTime: Date

    @Column()
    tokenType:string;

    @Column()
    sessionId:string;

   @ManyToOne(()=>User,user=>user.tokens)
    user:User


}