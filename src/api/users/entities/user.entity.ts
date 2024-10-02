import { Organization } from '../../organization/entities/organization.entity';
import { RideOption } from '../../ride-options/entities/ride-option.entity';
import { ERole } from '../../../enums/role.enum';
import { EUserStatus } from '../../../enums/user-status.enum';
import { EUSTimezones } from '../../../enums/timezones.enum';
import { Base } from '../../../shared/entities/base.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from 'typeorm';
import { Account } from '../../auth/entities/account.entity';
import { IUser } from '../interfaces/user.interface';

@Entity()
export class User extends Base implements IUser {
  @Column({ type: 'varchar', length: 150 })
  firstName: string;

  @Column({ type: 'varchar', length: 150 })
  lastName: string;

  @Column({ nullable: true, type: 'varchar', length: 150 })
  email: string;

  @Column({ nullable: true, type: 'varchar', length: 15 })
  phoneNumber: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  jobTitle: string;

  @Column({ type: 'enum', enum: ERole })
  role: ERole;

  @Column({ type: 'enum', enum: EUserStatus, default: EUserStatus.INVITED })
  status: EUserStatus;

  @Column('boolean')
  isTest: boolean;

  @OneToOne(() => Account, { nullable: true, eager: true, cascade: ['update', 'insert'] })
  @JoinColumn()
  account?: Account;

  @ManyToOne(() => Organization, { nullable: true, eager: false })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ type: 'enum', enum: EUSTimezones, nullable: true })
  preferredTimezone?: EUSTimezones;

  @Column({ type: 'varchar', array: true, nullable: true })
  vehicleTypes?: string[];

  @Column({ type: 'boolean', nullable: true, default: true })
  canReceiveSms?: boolean;

  @ManyToMany(() => RideOption, { nullable: true, cascade: true })
  @JoinTable({ name: 'drivers_additional_options' })
  rideOptions?: RideOption[];

  permission?: { hoList: [string] };
}
