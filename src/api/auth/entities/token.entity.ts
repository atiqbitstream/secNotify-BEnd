import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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

   


}