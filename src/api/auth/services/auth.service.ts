import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LogInAsJwtPayload } from "../Jwt.strategy";
import { UsersService } from "../../users/users.service";
import { TokenService } from "./token.service";
import { EmailSesService } from "../../../system-notification/email-ses/email-ses.service";
import { Password2faService } from "./password2fa.service";
import { ERole } from "../../../enums/role.enum";
import { EUserStatus } from "../../../enums/user-status.enum";
import * as resetPasswordHelper from "../../../utils/reset-password";
import {
  generateResetPasswordToken,
  generateResetPasswordTokenExpirationDate,
  isSamePassword
} from "../../../utils/reset-password";
import { BLOCKED_ACTIVITY_MESSAGE, DayInMilliseconds } from "../../../utils/constants";
import { addDays, isMinutePassedFrom } from "../../../utils/dates";
import { INVITATION_INVALID, USER_NOT_EXISTS } from "../../../utils/error-messages";
import { User } from "../../users/entities/user.entity";
import { Account } from "../entities/account.entity";
import { AccountDto } from "../dto/account.dto";
import { ChangePasswordDTO } from "../dto/change-password.dto";
import { LoginAsRoleDto } from "../dto/login-as-role.dto";
import { PasswordDTO } from "../dto/password.dto";
import { ResendInviteDto } from "../dto/resend-invite.dto";
import { UserLogin } from "../dto/user-login";
import { Credentials } from "../dto/auth-user.dto";
import { VerifyPasswordDto } from "../dto/verify-password.dto";
import { MessageDto } from "../../../shared/dto/message.dto";
import { UserDto } from "../../users/dto/user.dto";
import { hashPassword } from "../../../utils/hash-password";
import { CookieOptions } from "express";
import { PlatformSettingsService } from "../../../api/platform-settings/platform-settings.service";
import { UserPreferences } from "../../../api/platform-settings/entities/platform-settings.entity";
import { NotificationService } from "../../../api/notifications/notifications.service";
import { FileUploadService } from "../../../file-service/upload/file-upload.service";
import { AuditService } from "../../audit/audit.service";

const CAN_RESET_PASSWORD_FOR_ROLE = {
  [ERole.TC_ADMIN]: [ERole.TC_EMPLOYEE, ERole.TC_ADMIN, ERole.DRIVER],
  [ERole.TC_EMPLOYEE]: [ERole.DRIVER],
  [ERole.DRIVER]: [],
  [ERole.HO_ADMIN]: [ERole.HO_EMPLOYEE, ERole.HO_ADMIN],
  [ERole.HO_EMPLOYEE]: [],
  [ERole.SUPER_ADMIN]: [ERole.SUPER_ADMIN, ERole.HO_ADMIN, ERole.TC_ADMIN]
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly password2faService: Password2faService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailSesService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private platformSettingService: PlatformSettingsService,
    @Inject(forwardRef(() => NotificationService)) private notificationService: NotificationService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async login({ email, password }: Credentials): Promise<UserLogin> {
    const user = await this.usersService.findActiveByEmail(email);

    if (!user) {
      const msg = "Invalid credentials";
      this.logger.error({ message: `${msg}: Email ${email}` });
      throw new ForbiddenException(msg);
    }

    if (!user?.account?.password) {
      this.logger.error({ message: `Invalid credentials. Try to reset password` });
      throw new ForbiddenException("Invalid credentials. Try to reset password");
    }

    const platformSettings = await this.platformSettingService.findPlatformSettings(user.isTest);

    await this.checkIfBlocked(user.account, platformSettings?.userPreferences?.loginBlockedUntil);
    await this.validateAccount(password, user, platformSettings?.userPreferences);
    user.account.failedLoginAttempts = 0;
    user.account.blockedUntil = null;
    user.account.lastFailedLogin = null;

    // TODO: get user permission from permission table on the basis of user role & id
    //user.permission = {hoList: ['bb2737cf-7219-4534-a2d5-4947e8dfd2d1']};

    await this.accountRepository.save(user.account, { data: user });

    this.logger.log({ message: `Logging user ${email}` }, AuthService.name);
    const tokens = await this.tokenService.create(user);

    await this.tokenService.removeOtherTokensOnLogin(tokens.sessionId, user.id);

    this.logger.log({ message: `Triggering other devices logout` }, AuthService.name);
    this.notificationService.createAndSendLogoutNotifications(tokens.accessToken, user?.id);

    delete tokens.sessionId;

    return { ...tokens, user: UserDto.fromEntity(user) };
  }

  async leaveDashboard(refreshToken: string, caller: User): Promise<UserLogin> {
    await this.tokenService.removeTokensOnLogout(refreshToken);
    const user = await this.usersService.findActiveByEmail(caller.email);
    const tokens = await this.tokenService.create(user);
    return { ...tokens, user: UserDto.fromEntity(user) };
  }

  private async checkIfBlocked(account: Account, blockedHours: number): Promise<void> {
    const now = new Date();
    if (account?.blockedUntil && now.getTime() < account.blockedUntil?.getTime()) {
      account.blockedUntil = new Date(now.getTime() + blockedHours * 3600000);
      await this.accountRepository.save(account);
      throw new ForbiddenException(BLOCKED_ACTIVITY_MESSAGE);
    }
  }

  async refreshToken(refreshToken: string): Promise<UserLogin> {
    try {
      const payload: Partial<LogInAsJwtPayload> = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("jwt").refreshSecret,
        ignoreExpiration: true
      });
      const user = await this.usersService.findActiveByEmail(payload.email);
      if (!user) {
        const msg = "Something went wrong. Please, try again";
        this.logger.error(`${msg}: Email ${payload.email}`);
        throw new UnauthorizedException(msg);
      }
      return {
        ...(await this.tokenService.update(refreshToken, payload)),
        user: await this.getUserProfile(user, payload)
      };
    } catch (e) {
      console.log("AuthService, refreshToken => ", e);
      this.logger.error(`${e.name}: ${e.message}`);
      throw new UnauthorizedException(e.message);
    }
  }

  async getProfileFromRequest(user: User, jwtToken: string): Promise<UserDto> {
    if (!user) {
      return;
    }
    const payload: Partial<LogInAsJwtPayload> = this.jwtService.verify(jwtToken, {
      secret: this.configService.get("jwt").accessSecret
    });
    return this.getUserProfile(user, payload);
  }

  async getUserProfile(user: User, payload: Partial<LogInAsJwtPayload>): Promise<UserDto> {
    const userDto = UserDto.fromEntity(user);
    if (user.role === ERole.SUPER_ADMIN && payload.onBehalfRole) {
      userDto.role = payload.onBehalfRole;
      userDto.organizationId = payload.organizationId;
      const admin = await this.usersService.getOrganizationAdmin(payload.organizationId);
      userDto["onBehalfOfRoleId"] = admin.id;
    }

    if (payload.permission) {
      userDto.permission = payload.permission;
    }

    return userDto;
  }

  async findUserByResetToken(resetPasswordToken: string): Promise<Account> {
    const account = await this.accountRepository.findOneBy({ resetPasswordToken });
    const date = Date.now();

    if (!account?.resetPasswordExpires || date > account?.resetPasswordExpires?.getTime()) {
      throw new HttpException(
        "Password reset key is invalid or has expired. Please try again.",
        HttpStatus.BAD_REQUEST
      );
    }
    return account;
  }

  async changeMyPasswordRequest(body: ChangePasswordDTO, currentUser: User): Promise<boolean> {
    this.usersService.restrictDashboardUser(currentUser);
    const account = await this.accountRepository.findOneBy({ id: currentUser.account?.id });
    await this.usersService.validatePassword(body.oldPassword, account.password);
    const { verificationCode } = await this.password2faService.generate2faToken({
      newPasswordHash: body.newPassword,
      user: currentUser
    });
    await this.emailService.changePassword2fa(currentUser.email, verificationCode, currentUser.isTest);

    return true;
  }

  async changeMyPasswordVerify({ token, newPassword }: VerifyPasswordDto, currentUser: User): Promise<MessageDto> {
    const account = await this.accountRepository.findOneBy({ id: currentUser.account?.id });
    const password2faRecord = await this.password2faService.getRecord(currentUser.id);
    await this.usersService.validatePassword(newPassword, password2faRecord.newPasswordHash);
    if (password2faRecord.verificationCode !== token) {
      throw new HttpException("invalid verification code", HttpStatus.BAD_REQUEST);
    }
    // password should be validated on previous request
    account.password = await hashPassword(newPassword);
    await this.accountRepository.save(account, { data: currentUser });
    await this.password2faService.deleteUserRecords(currentUser.id);
    return { message: "Password has been changed" };
  }

  async changePassword({ password }: PasswordDTO, token: string): Promise<MessageDto> {
    const account = await this.findUserByResetToken(token);
    account.resetPasswordToken = null;
    account.resetPasswordExpires = null;
    account.failedLoginAttempts = 0;
    account.blockedUntil = null;
    account.password = await hashPassword(password);

    await this.accountRepository.save(account);
    return { message: "Password has been changed" };
  }

  async resetPassword(email: string): Promise<MessageDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      const msg = "No such user";
      this.logger.error(msg);
      throw new NotFoundException(msg);
    }

    if (user.status === EUserStatus.ACTIVE) {
      return this.resetPasswordForUser(user);
    } else if (user.status === EUserStatus.INVITED) {
      return this.resentInvitationForUser(user);
    } else if (user.status === EUserStatus.DISABLED) {
      const msg = `Your account was blocked`;
      this.logger.error(msg);
      throw new ForbiddenException(msg);
    }
  }

  async resendInvitationById(id: string, currentUser: User): Promise<MessageDto> {
    const user = await this.findExistingUserById(id);
    if (!AuthService.canResendInvitation(currentUser, user)) {
      const msg = `You don't have permission`;
      this.logger.error(msg);
      throw new ForbiddenException(msg);
    }
    return this.resentInvitationForUser(user);
  }

  async resetPasswordById(id: string, currentUser: User): Promise<MessageDto> {
    const user = await this.findExistingUserById(id);
    if (!AuthService.canResetPassword(currentUser, user)) {
      const msg = `You don't have permission`;
      this.logger.error(msg);
      throw new ForbiddenException(msg);
    }
    return this.resetPasswordForUser(user, currentUser);
  }

  private async findExistingUserById(id: string) {
    const user = await this.usersService.findByIdWithAccount(id);
    if (!user) {
      const msg = "No such user";
      this.logger.error(msg);
      throw new NotFoundException(msg);
    }
    return user;
  }

  private async resentInvitationForUser(user: User) {
    if (!user.account) {
      user.account = this.usersService.generateAccount(user);
    }
    user.account.resetPasswordToken = resetPasswordHelper.generateResetPasswordToken();
    user.account.resetPasswordExpires = resetPasswordHelper.generateResetPasswordTokenExpirationDate();
    await this.accountRepository.save(user.account);
    await this.emailService.createAccount(user);
    return { message: "The invitation has been resubmitted" };
  }

  private async resetPasswordForUser(user: User, currentUser?: User): Promise<MessageDto> {
    if (!user.account) {
      user.account = this.usersService.generateAccount(user);
    }
    user.account.resetPasswordToken = generateResetPasswordToken();
    user.account.resetPasswordExpires = generateResetPasswordTokenExpirationDate();
    await this.accountRepository.save(user.account, { data: currentUser });
    await this.emailService.resetPassword(user);
    return { message: "Email has been sent" };
  }

  private static canResetPassword(currentUser: User, user: User): boolean {
    return (
      user.status === EUserStatus.ACTIVE &&
      currentUser.status === EUserStatus.ACTIVE &&
      CAN_RESET_PASSWORD_FOR_ROLE[currentUser.role].includes(user.role) &&
      (currentUser.role === ERole.SUPER_ADMIN || currentUser.organizationId === user.organizationId)
    );
  }

  private static canResendInvitation(currentUser: User, user: User): boolean {
    return (
      user.status === EUserStatus.INVITED &&
      currentUser.status === EUserStatus.ACTIVE &&
      CAN_RESET_PASSWORD_FOR_ROLE[currentUser.role].includes(user.role) &&
      (currentUser.role === ERole.SUPER_ADMIN || currentUser.organizationId === user.organizationId)
    );
  }

  async validateUser(payload: Partial<LogInAsJwtPayload>): Promise<User> {
    const user = await this.usersService.findByIdWithAccount(payload.id);
    if (!user || user.status === EUserStatus.DISABLED) {
      throw new UnauthorizedException("Invalid token");
    }
    if (user.role !== payload.role) {
      throw new UnauthorizedException({ roleChanged: true, message: "Your role has been changed" });
    }
    if (user.role === ERole.SUPER_ADMIN && payload.onBehalfRole) {
      user.role = payload.onBehalfRole;
      user.organizationId = payload.organizationId;
      const admin = await this.usersService.getOrganizationAdmin(user.organizationId);
      user["onBehalfOfRoleId"] = admin.id;
    }

    if (payload.permission) {
      user.permission = payload.permission;
    }

    return user;
  }

  private async checkLoginAttempts(userAccount: User, userPreferences: UserPreferences) {
    const { account, ...user } = userAccount;
    account.lastFailedLogin = new Date();
    account.failedLoginAttempts =
      account.lastFailedLogin && !isMinutePassedFrom(account?.lastFailedLogin)
        ? (account.failedLoginAttempts || 0) + 1
        : 1;

    if (account.failedLoginAttempts >= userPreferences?.passwordRetries) {
      const now = new Date();
      account.blockedUntil = new Date(now.getTime() + userPreferences.loginBlockedUntil * 3600000);
      await this.accountRepository.save(account, { data: user });
      this.throwLoginError(BLOCKED_ACTIVITY_MESSAGE);
    }
    await this.accountRepository.save(account);
  }

  private async validateAccount(password: string, user: User, userPreferences: UserPreferences): Promise<void> {
    const isPasswordMatch = await isSamePassword(password, user.account.password);
    if (!isPasswordMatch) {
      await this.checkLoginAttempts(user, userPreferences);
      this.throwLoginError(
        `Invalid credentials You have ${
          userPreferences?.passwordRetries - user.account.failedLoginAttempts
        } more retries until your account is locked.`
      );
    }
  }

  private throwLoginError(message: string) {
    this.logger.error({ message: `${message}`, action: "Attempt Login", response: "Failed" });
    throw new ForbiddenException(message);
  }

  async loginAsRole(user: User, loginAsDto: LoginAsRoleDto): Promise<UserLogin> {
    const payload: Partial<LogInAsJwtPayload> = {
      id: user.id,
      role: user.role,
      email: user.email,
      permission: user.permission
    };
    payload.onBehalfRole = loginAsDto.role;
    payload.organizationId = loginAsDto.organizationId;

    return {
      ...(await this.tokenService.create(user, payload)),
      user: await this.getUserProfile(user, payload)
    };
  }

  prepareCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      maxAge: DayInMilliseconds,
      expires: addDays(new Date(), 1),
      secure: this.configService.get("environment") !== "local",
      path: "/",
      sameSite: "lax"
    };
  }

  async verifyToken(token: string): Promise<Account> {
    if (!token) {
      throw new HttpException("Reset key is invalid", HttpStatus.BAD_REQUEST);
    }
    const account = await this.accountRepository.findOne({
      where: { resetPasswordToken: token },
      join: {
        alias: "account",
        leftJoinAndSelect: {
          user: "account.user"
        }
      }
    });
    if (!account) {
      throw new HttpException("Account not found", HttpStatus.NOT_FOUND);
    }

    return account;
  }

  async setExternalAccount(resetPasswordToken: string): Promise<any> {
    const verifyAccountToken = await this.verifyToken(resetPasswordToken);

    if (!verifyAccountToken) {
      throw new HttpException("Reset key is invalid", HttpStatus.BAD_REQUEST);
    }

    verifyAccountToken.user.status = EUserStatus.ACTIVE;
    verifyAccountToken.user.jobTitle = ERole.DRIVER;

    await this.accountRepository.save(verifyAccountToken);

    return { message: "Driver has been activated" };
  }

  async setAccount(body: AccountDto, resetPasswordToken: string): Promise<UserLogin> {
    if (!resetPasswordToken) {
      throw new HttpException("Reset key is invalid", HttpStatus.BAD_REQUEST);
    }
    const account = await this.accountRepository.findOne({
      where: { resetPasswordToken },
      join: {
        alias: "account",
        leftJoinAndSelect: {
          user: "account.user"
        }
      }
    });

    if (!account) {
      throw new HttpException("Account not found", HttpStatus.NOT_FOUND);
    }

    account.resetPasswordToken = null;
    account.resetPasswordExpires = null;
    account.failedLoginAttempts = 0;
    account.password = await hashPassword(body.password);

    account.user.status = EUserStatus.ACTIVE;
    account.user.jobTitle = body.jobTitle;
    account.user.phoneNumber = body.phoneNumber;

    const { user } = await this.accountRepository.save(account);
    return {
      ...(await this.tokenService.create(user)),
      user: UserDto.fromEntity(user)
    };
  }

  async checkInvitationKey(resetPasswordToken: string): Promise<void> {
    const account = await this.accountRepository.findOneBy({ resetPasswordToken });
    if (!account) {
      throw new HttpException(INVITATION_INVALID, HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    const expiresAt = account.resetPasswordExpires;
    if (expiresAt.getTime() < now.getTime()) {
      throw new HttpException("The invitation link has expired", HttpStatus.FORBIDDEN);
    }
  }

  async resendInvitation({ email }: ResendInviteDto): Promise<MessageDto> {
    const account = await this.accountRepository.findOne({
      where: {
        user: { email }
        // resetPasswordToken // temp
      },
      relations: ["user"]
    });

    if (!account) {
      throw new HttpException(USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
    }
    account.resetPasswordToken = resetPasswordHelper.generateResetPasswordToken();
    account.resetPasswordExpires = resetPasswordHelper.generateResetPasswordTokenExpirationDate();
    await this.accountRepository.save(account);
    await this.emailService.createAccount(account.user, account.resetPasswordToken);
    return { message: "The invitation has been resent" };
  }

  public async getUserFromAuthenticationToken(token: string): Promise<User> {
    try {
      const payload: LogInAsJwtPayload = this.jwtService.verify(token, {
        secret: this.configService.get("jwt").accessSecret
      });
      if (payload.id) {
        const user = await this.usersService.findById(payload.id);
        if (!user) {
          throw new HttpException(USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
        }
        if (user.role === ERole.SUPER_ADMIN && payload.onBehalfRole) {
          user.role = payload.onBehalfRole;
          user.organizationId = payload.organizationId;
          const admin = await this.usersService.getOrganizationAdmin(user.organizationId);
          user["onBehalfOfRoleId"] = admin.id;
        }
        return user;
      }
    } catch (e) {
      this.logger.error(e.message || e);
      console.log("AuthService, getUserFromAuthenticationToken => ", e);
      return;
    }
  }
  
  async getSignedUrl(filter: any, user: User) {
    const invoiceBucket = process.env.AWS_S3_BUCKET;
    this.logger.log(AuthService.name, "Get signed URL for invoice from fPath", invoiceBucket, filter.fPath);
    this.auditService.log("tc_invoice", "FETCH", user, { filter }, {}, "Get signed URL for invoice from fPath");
    return this.fileUploadService.getPreSignedURLToViewObject(invoiceBucket, filter.fPath);
  }
}
