import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../decorators/roles.decorator";
import { ERole } from "../../enums/role.enum";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ChangeEmailDTO } from "./dto/change-email.dto";
import { UpdatePersonalInfoDto } from "./dto/update-personal-info.dto";
import { PaginatedUsersDto } from "./dto/user-overview.dto";
import { Request } from "express";
import { SearchDto } from "../../shared/dto/search.dto";
import { MessageDto } from "../../shared/dto/message.dto";
import { ChangeUserStatusDto } from "../../shared/dto/change-user-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UndefinedFieldsValidationPipe } from "../../pipes/undefined-fields-validation.pipe";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags("User")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(ERole.SUPER_ADMIN, ERole.TC_ADMIN, ERole.HO_ADMIN)
  @ApiOperation({ summary: "Create user & send invitation" })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 200, type: MessageDto })
  async create(@Body() createUserDto: CreateUserDto, @Req() { user }: Request): Promise<MessageDto> {
    return this.usersService.createDerivativeUser(createUserDto, user);
  }

  @Post("createAdmin")
  @Roles(ERole.SUPER_ADMIN, ERole.TC_ADMIN, ERole.HO_ADMIN)
  @ApiOperation({ summary: "Create admin users for HO & TC than send invitation email" })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 200, type: MessageDto })
  async createAdmin(@Body() createUserDto: CreateUserDto, @Req() { user }: Request): Promise<MessageDto> {
    return this.usersService.createAdminUser(createUserDto, user);
  }

  @Get("profile")
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ status: 200, type: UserDto })
  getProfile(@Req() req: Request): User {
    const { account, ...user } = req.user;

    return user;
  }

  @Get()
  @Roles(ERole.SUPER_ADMIN, ERole.HO_ADMIN, ERole.TC_ADMIN, ERole.HO_EMPLOYEE, ERole.TC_EMPLOYEE)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, type: PaginatedUsersDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filters: SearchDto, @Req() { user }: Request): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(filters, user);
  }

  @Get(":id")
  @Roles(ERole.SUPER_ADMIN, ERole.HO_ADMIN, ERole.TC_ADMIN)
  @ApiOperation({ summary: "Get user by id" })
  @ApiResponse({ status: 200, type: UserDto })
  async findOne(@Param("id", ParseUUIDPipe) id: string, @Req() { user }: Request): Promise<UserDto> {
    return this.usersService.findOneByIdOrFail(id, user);
  }

  @Put("change-email")
  @ApiOperation({ summary: "Change my email" })
  @ApiResponse({ status: 200 })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changeEmail(@Req() { user }: Request, @Body() changeEmailDTO: ChangeEmailDTO): Promise<void> {
    return this.usersService.changeMyEmail(changeEmailDTO, user);
  }

  @Put(":id")
  @Roles(ERole.SUPER_ADMIN, ERole.HO_ADMIN, ERole.TC_ADMIN)
  @ApiOperation({ summary: "Update user by id" })
  @ApiResponse({ status: 200, type: UserDto })
  @UsePipes(new UndefinedFieldsValidationPipe())
  async updateById(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() { user }: Request
  ): Promise<UserDto> {
    return this.usersService.updateById(id, updateUserDto, user);
  }

  @Put()
  @ApiOperation({ summary: "Update my user`s profile" })
  @ApiResponse({ status: 200, type: UserDto })
  @UsePipes(new UndefinedFieldsValidationPipe())
  async update(@Req() { user }: Request, @Body() updateUserDto: UpdatePersonalInfoDto): Promise<UserDto> {
    return this.usersService.updateMyPersonalInfo(updateUserDto, user);
  }

  @Patch(":id")
  @Roles(ERole.SUPER_ADMIN, ERole.HO_ADMIN, ERole.TC_ADMIN, ERole.TC_EMPLOYEE)
  @ApiOperation({ summary: "Disable user by id" })
  @ApiResponse({ status: 200, type: UserDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async disable(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() { status }: ChangeUserStatusDto,
    @Req() { user }: Request
  ): Promise<UserDto | string> {
    return this.usersService.updateUserStatus(id, status, user);
  }

  @Get("organization/:organizationId")
  @Roles(ERole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get organization users" })
  @ApiResponse({ status: 200, type: [UserDto] })
  async getOrganizationUsers(
    @Param("organizationId", ParseUUIDPipe) organizationId: string,
    @Req() { user }: Request
  ): Promise<UserDto[]> {
    return this.usersService.getAllOrganizationUsers(organizationId, user);
  }
}
