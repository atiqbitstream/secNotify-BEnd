import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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

}