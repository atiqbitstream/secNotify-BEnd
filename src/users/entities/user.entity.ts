import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ERole } from "../enums/roles.enum";


@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id:number;

  @Column({ type: 'varchar', length: 150 })
  username: string;
     
  @Column({ type: 'varchar', length: 150 })
  firstName: string;

  @Column({ type: 'varchar', length: 150 })
  lastName: string;

  @Column({ nullable: true, type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'enum', enum: ERole })
  role: ERole;
 
  @Column()
  password:string;

  @Column({ nullable: true })

  organizationId?: string;

  
}
