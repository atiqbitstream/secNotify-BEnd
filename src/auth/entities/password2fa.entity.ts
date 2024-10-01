import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Password2fa {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    verificationCode: string

    @Column()
    newPasswordHash: string



}