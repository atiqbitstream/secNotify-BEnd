
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { Account } from "./account.entity";

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

   
    @ManyToOne(()=>User,(user)=>user.tokens)
     user:User;

    

}

