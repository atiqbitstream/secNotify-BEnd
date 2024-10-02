import { HttpStatus, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { DataSource, FindOptionsWhere, In } from "typeorm";
import { EUSTimezones } from "../../enums/timezones.enum";
import { ERole } from "../../enums/role.enum";
import { EUserStatus } from "../../enums/user-status.enum";
import { EmailSesService } from "../../system-notification/email-ses/email-ses.service";
import { ATLEAST_ONE_ADMIN_REQUIRED, DONT_HAVE_PERMISSIONS, USER_NOT_EXISTS } from "../../utils/error-messages";
import { MHCronExpressions } from "../../utils/constants";
import { getRoleByCreator, TC_ROLES } from "../../utils/roles";
import { hasEmailChanged } from "../../utils/email";
import * as resetPasswordHelper from "../../utils/reset-password";
import { UserConfig } from "../../interfaces/user-config";
import { Account } from "../auth/entities/account.entity";
import { User } from "./entities/user.entity";
import { UserRepository } from "./users.repository";
import { SearchDto } from "../../shared/dto/search.dto";
import { MessageDto } from "../../shared/dto/message.dto";
import { ChangeEmailDTO } from "./dto/change-email.dto";
import { UpdatePersonalInfoDto } from "./dto/update-personal-info.dto";
import { PaginatedUsersDto } from "./dto/user-overview.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";
import { AuditService } from "../audit/audit.service";
import { Organization } from "../organization/entities/organization.entity";

@Injectable()
export class UsersService {
  runJobs = true;

  constructor(
    private emailService: EmailSesService,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private auditService: AuditService,
    private dataSource: DataSource
  ) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id }, loadEagerRelations: true, relations: ["organization"] });
  }

  async findByIdWithAccount(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      loadEagerRelations: true,
      relations: ["organization"]
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async findActiveByEmail(email: string): Promise<User> {
    return this.userRepository.findActiveByEmail(email);
  }

  public getActiveOrganizationUsers(organizationId: string): Promise<User[]> {
    if (!organizationId) {
      throw new HttpException("Organization id is not provided", HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.findBy({
      organizationId,
      status: EUserStatus.ACTIVE,
      role: In([ERole.HO_ADMIN, ERole.TC_ADMIN, ERole.HO_EMPLOYEE, ERole.TC_EMPLOYEE])
    });
  }

  public getActiveTcUsers(organizationId: string): Promise<User[]> {
    if (!organizationId) {
      throw new HttpException("Organization id is not provided", HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.findBy({
      organizationId,
      status: EUserStatus.ACTIVE,
      role: In([ERole.TC_ADMIN, ERole.TC_EMPLOYEE])
    });
  }

  public getActiveTcAdmins(organizationId: string): Promise<User[]> {
    if (!organizationId) {
      throw new HttpException("Organization id is not provided", HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.findBy({
      organizationId,
      status: EUserStatus.ACTIVE,
      role: In([ERole.TC_ADMIN])
    });
  }

  public getActiveHoAdmins(organizationId: string): Promise<User[]> {
    if (!organizationId) {
      throw new HttpException("Organization id is not provided", HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.findBy({
      organizationId,
      status: EUserStatus.ACTIVE,
      role: In([ERole.HO_ADMIN])
    });
  }

  private async getAnyAdminForDisableOrganization(organizationId: string) {
    const user = await this.userRepository.findOneBy({
      organizationId,
      role: In([ERole.HO_ADMIN, ERole.TC_ADMIN])
    });

    if (!user) {
      throw new HttpException("You cannot get this user", HttpStatus.FORBIDDEN);
    }

    return user;
  }

  private async getActiveAdminForActiveOrganization(organizationId: string) {
    const user = await this.userRepository.findOneBy({
      organizationId,
      role: In([ERole.HO_ADMIN, ERole.TC_ADMIN]),
      status: EUserStatus.ACTIVE
    });

    if (!user) {
      throw new HttpException("You cannot get this user", HttpStatus.FORBIDDEN);
    }

    return user;
  }

  public async getOrganizationAdmin(organizationId: string): Promise<User> {
    try {
      if (!organizationId) {
        throw new HttpException("Organization id is not provided", HttpStatus.BAD_REQUEST);
      }

      const organization = await this.dataSource.getRepository(Organization).findOneBy({ id: organizationId });
      const user = !organization?.disabled
        ? await this.getActiveAdminForActiveOrganization(organizationId)
        : await this.getAnyAdminForDisableOrganization(organizationId);

      return user;
    } catch (e) {
      console.log("getOrganizationAdmin =>", organizationId, e);
    }
  }

  public getActiveSuperAdmins(isTest: boolean): Promise<User[]> {
    return this.userRepository.findBy({ role: ERole.SUPER_ADMIN, status: EUserStatus.ACTIVE, isTest });
  }

  public getActiveSuperAdmin(isTest: boolean): Promise<User> {
    return this.userRepository.findOneBy({ role: ERole.SUPER_ADMIN, status: EUserStatus.ACTIVE, isTest });
  }

  public async getActiveUsersByTcMap(organizations: string[]): Promise<Record<string, User[]>> {
    const tcUsers = await this.userRepository.findBy({
      organization: { id: In(organizations) },
      role: In(TC_ROLES),
      status: EUserStatus.ACTIVE
    });

    return UsersService.groupUsersByTc(tcUsers);
  }

  private static groupUsersByTc(tcUsers: User[]): Record<string, User[]> {
    return tcUsers.reduce((result, currentValue: User) => {
      const key = currentValue.organizationId;

      if (!result[key]) {
        result[key] = [];
      }

      result[key].push(currentValue);

      return result;
    }, {} as Record<string, User[]>);
  }

  public async ensureUserIsUnique(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new HttpException("User with this email already exists", HttpStatus.CONFLICT);
    }
  }

  public async initializeUniqueUser(
    userData: CreateUserDto,
    { hasAccount = true, ...additionalProps }: UserConfig
  ): Promise<User> {
    await this.ensureUserIsUnique(userData.email);
    const user = this.userRepository.create({
      ...userData,
      ...additionalProps
    });

    if (hasAccount) {
      user.account = this.generateAccount(user);
    }

    return user;
  }

  async createUser(newUser: User, creator: User): Promise<MessageDto> {
    // check if driver will use our portal or not
    if (newUser.account) {
      await this.userRepository.save(newUser, { data: creator });
      await this.emailService.createAccount(newUser);
      return { message: "The invitation has been sent" };
    } else {
      newUser.account = this.generateAccount(newUser);
      await this.userRepository.save(newUser, { data: creator });
      await this.emailService.sendExternalDriverInvitation(newUser, newUser.account.resetPasswordToken);
      return { message: "The invitation has been sent" };
    }
  }

  generateAccount(currentUser: User): Account {
    const account = new Account();
    account.resetPasswordToken = resetPasswordHelper.generateResetPasswordToken();
    account.resetPasswordExpires = resetPasswordHelper.generateResetPasswordTokenExpirationDate();
    currentUser.account = account;

    return currentUser.account;
  }

  public async createDerivativeUser(userDto: CreateUserDto, creator: User): Promise<MessageDto> {
    const { role, organizationId, isTest } = creator;
    const userConfig: UserConfig = { organizationId, isTest, role: getRoleByCreator(role) };
    const newUser = await this.initializeUniqueUser(userDto, userConfig);

    return this.createUser(newUser, creator);
  }

  public async createAdminUser(userDto: CreateUserDto, creator: User): Promise<MessageDto> {
    const { role, organizationId, isTest } = creator;
    const userConfig: UserConfig = { organizationId, isTest, role: role };
    const newUser = await this.initializeUniqueUser(userDto, userConfig);

    return this.createUser(newUser, creator);
  }

  async findAll(filters: SearchDto, user: User): Promise<PaginatedUsersDto> {
    this.auditService.log(User.name, "FETCH", user);

    return this.userRepository.findPaginatedUsers(filters, user);
  }

  async findOneByIdOrFail(id: string, currentUser: User): Promise<UserDto> {
    const query: FindOptionsWhere<User> = { id };

    if (currentUser.organizationId) {
      query.organizationId = currentUser.organizationId;
    }

    const user = await this.userRepository.findOne({ where: query, loadEagerRelations: false });

    if (!user) {
      throw new HttpException(USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
    }

    this.auditService.log(User.name, "FETCH", currentUser, user);

    return UserDto.fromEntity(user);
  }

  restrictDashboardUser(user: User): void {
    if (!!user["onBehalfOfRoleId"]) {
      throw new HttpException(DONT_HAVE_PERMISSIONS, HttpStatus.FORBIDDEN);
    }
  }

  async validatePassword(password: string, hashedPassword: string): Promise<void> {
    const isPasswordMatch = await resetPasswordHelper.isSamePassword(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new HttpException("Password is invalid.", HttpStatus.BAD_REQUEST);
    }
  }

  async changeMyEmail(changeEmailDTO: ChangeEmailDTO, currentUser: User): Promise<void> {
    this.restrictDashboardUser(currentUser);
    const user = await this.userRepository.findOneBy({ id: currentUser.id });
    await this.validatePassword(changeEmailDTO.password, user.account.password);
    await this.ensureUserIsUnique(changeEmailDTO.newEmail);
    await this.userRepository.save({ ...user, email: changeEmailDTO.newEmail }, { data: currentUser });
  }

  async updateById(id: string, dto: UpdateUserDto, currentUser: User): Promise<UserDto> {
    let user = await this.userRepository.findUserOrFail(id, currentUser);
    const isEmailChanged = dto.email && hasEmailChanged(user.email, dto.email);

    if (isEmailChanged) {
      await this.ensureUserIsUnique(dto.email);
    }

    if (user.status === EUserStatus.INVITED && isEmailChanged) {
      if (!user.account) throw new HttpException("Account does not exist", HttpStatus.BAD_REQUEST);
      user.account.resetPasswordExpires = resetPasswordHelper.generateResetPasswordTokenExpirationDate();
      user.account.resetPasswordToken = resetPasswordHelper.generateResetPasswordToken();
    }

    ({ ...user } = { ...user, ...dto });
    await this.userRepository.save(user, { data: currentUser });

    if (user.status === EUserStatus.INVITED && isEmailChanged) {
      await this.emailService.createAccount(user);
    }

    return UserDto.fromEntity(user);
  }

  async updateMyPersonalInfo(updateUserDto: UpdatePersonalInfoDto, currentUser: User): Promise<UserDto> {
    this.restrictDashboardUser(currentUser);
    let user = await this.userRepository.findOne({ where: { id: currentUser.id }, loadEagerRelations: false });

    if (!user) {
      throw new HttpException(USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
    }

    ({ ...user } = { ...user, ...updateUserDto });
    await this.userRepository.save(user, { data: currentUser });

    return UserDto.fromEntity(user);
  }

  async updateUserStatus(id: string, status: EUserStatus, currentUser: User): Promise<UserDto> {
    const user = await this.userRepository.findUserOrFail(id, currentUser, true);
    const adminRole = [ERole.HO_ADMIN, ERole.TC_ADMIN];

    if (adminRole.includes(user.role)) {
      const adminUsersCount = await this.userRepository.count({
        where: {
          organizationId: user.organizationId,
          role: user.role
        }
      });

      if (adminUsersCount <= 1) {
        throw new HttpException(ATLEAST_ONE_ADMIN_REQUIRED, HttpStatus.NOT_ACCEPTABLE);
      }
    }

    user.status = status;
    const { account, ...updatedUser } = await this.userRepository.save(user, { data: currentUser });

    return UserDto.fromEntity(updatedUser);
  }

  public async getAllOrganizationUsers(organizationId: string, user: User): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { organizationId },
      loadEagerRelations: false,
      order: { firstName: "ASC", lastName: "ASC" }
    });

    this.auditService.log(User.name, "FETCH", user, users);

    return users.map((user) => UserDto.fromEntity(user));
  }

  public async swapRolesAndSave(user: User, admin: User, superAdmin: User): Promise<User> {
    [user.role, admin.role] = [admin.role, user.role];
    await this.userRepository.save([user, admin], { data: superAdmin });

    return [user, admin].find((u) => [ERole.HO_ADMIN, ERole.TC_ADMIN].includes(u.role));
  }

  async getUserName(messageTo: string): Promise<UserDto> {
    try {
      const user = await this.userRepository.findUserByPhoneEmail(messageTo);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return UserDto.fromEntity(user);
    } catch (err) {
      console.log("getUserName", err);

      return null;
    }
  }

  @Cron(MHCronExpressions.EveryMondayAt7AM, { timeZone: EUSTimezones.CST })
  async ridesReminder() {
    if (this.configService.get("environment") && this.configService.get("environment") !== "local" && this.runJobs) {
      const users = await this.userRepository.find({
        where: {
          status: EUserStatus.ACTIVE,
          role: In([ERole.HO_ADMIN, ERole.HO_EMPLOYEE])
        }
      });

      for (const user of users) {
        await this.emailService.ridesReminder(user);
      }
    }
  }
}
