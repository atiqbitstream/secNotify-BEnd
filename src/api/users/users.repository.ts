import { Injectable, NotFoundException } from "@nestjs/common";
import { ERideStatus } from "../../enums/ride-status.enum";
import { ERole } from "../../enums/role.enum";
import { EUserStatus } from "../../enums/user-status.enum";
import { SearchDto } from "../../shared/dto/search.dto";
import { IPaginated } from "../../shared/dto/paginated.dto";
import { formPaginationMeta } from "../../shared/pagination";
import { USER_NOT_EXISTS } from "../../utils/error-messages";
import { AVAILABLE_USERS_FOR_ROLE, MANAGEABLE_USERS_FOR_ROLE } from "../../utils/roles";
import { Brackets, DataSource, FindOptionsWhere, In, Repository, SelectQueryBuilder } from "typeorm";
import { DriverOverviewDto, PaginatedDriversDto } from "../driver/dto/driver-overview.dto";
import { RideEntity } from "../ride-requests/entities/ride-request.entity";
import { PaginatedUsersDto, UserOverviewDto } from "./dto/user-overview.dto";
import { User } from "./entities/user.entity";
import { IUser } from "./interfaces/user.interface";

const PAGINATED_USER_COLS: (keyof UserOverviewDto)[] = [
  "id",
  "email",
  "firstName",
  "lastName",
  "jobTitle",
  "phoneNumber",
  "role",
  "status",
  "organization",
  "updatedAt",
  "createdAt"
];

const PAGINATED_DRIVER_COLS: (keyof DriverOverviewDto)[] = [
  "id",
  "firstName",
  "lastName",
  "email",
  "status",
  "updatedAt",
  "createdAt",
  "vehicleTypes"
];

const USER_ALIAS = "user";
const addAliasToColumns = (cols: (keyof IUser)[] = [], alias: string = USER_ALIAS): string[] => {
  return cols.map((col) => `(${alias}.${col})`);
};

@Injectable()
export class UserRepository extends Repository<User> {
  userQueryBuilder: Repository<User>;

  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
    this.userQueryBuilder = this.dataSource.getRepository(User);
  }

  private async findPaginated<T>(filters: SearchDto, user: User, driverPagination = false): Promise<IPaginated<T>> {
    const take = filters.docsPerPage;
    const skip = take * (filters.page - 1);
    const selectColumns = driverPagination ? PAGINATED_DRIVER_COLS : PAGINATED_USER_COLS;
    const query = this.userQueryBuilder
      .createQueryBuilder(USER_ALIAS)
      .select(addAliasToColumns(selectColumns))
      .take(take)
      .skip(skip)
      .where(`${USER_ALIAS}.isTest = :isTest`, { isTest: user.isTest });

    if (driverPagination) {
      query.andWhere(`${USER_ALIAS}.role = :role`, { role: ERole.DRIVER });
    } else {
      query.andWhere(`${USER_ALIAS}.role IN (:...roles)`, { roles: AVAILABLE_USERS_FOR_ROLE[user.role] });
    }

    if (user.role !== ERole.SUPER_ADMIN) {
      query.andWhere(`${USER_ALIAS}.organizationId = :orgId`, { orgId: user.organizationId || user.organization?.id });
    }

    this.addSearchCondition(query, filters.value);

    const totalElements = await query.getCount();
    const users = await query
      .addSelect(`CASE WHEN "user"."id"='${user.id}' THEN '1' ELSE '0' END`, "priority")
      .orderBy({ priority: "DESC" })
      .addOrderBy(`${USER_ALIAS}.firstName`, "ASC")
      .addOrderBy(`${USER_ALIAS}.lastName`, "ASC")
      .getRawMany<T>();

    return { data: users, meta: formPaginationMeta(totalElements, filters.page, take) };
  }

  async findPaginatedUsers(filters: SearchDto, user: User): Promise<PaginatedUsersDto> {
    return this.findPaginated<UserOverviewDto>(filters, user);
  }

  async findPaginatedDrivers(filters: SearchDto, user: User): Promise<PaginatedDriversDto> {
    return this.findPaginated<DriverOverviewDto>(filters, user, true);
  }

  private addSearchCondition(query: SelectQueryBuilder<User>, value) {
    if (value) {
      const search = `%${value.toLowerCase()}%`;
      query.andWhere(
        new Brackets((qb) =>
          qb
            .where(`(LOWER(${USER_ALIAS}.firstName) || ' ' || LOWER(${USER_ALIAS}.lastName) LIKE :search)`, { search })
            .orWhere(`(LOWER(${USER_ALIAS}.email) LIKE :search)`, { search })
        )
      );
    }
  }

  async findUserOrFail(id: string, { role, organizationId }: User, excludeInvitedStatus = false): Promise<User> {
    const statuses = Object.values(EUserStatus);
    if (excludeInvitedStatus) {
      const invIndx = statuses.indexOf(EUserStatus.INVITED);
      if (invIndx > -1) {
        statuses.splice(invIndx, 1);
      }
    }

    const user = await this.userQueryBuilder
      .createQueryBuilder(USER_ALIAS)
      .where("user.id = :id", { id })
      .andWhere("user.role IN (:...roles)", { roles: MANAGEABLE_USERS_FOR_ROLE[role] })
      .andWhere("user.status IN (:...statuses)", { statuses })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("(user.role = :role AND user.organizationId IS NULL)", { role: ERole.SUPER_ADMIN })
            .orWhere("(user.organization IS NOT NULL AND user.organizationId = :orgId)", { orgId: organizationId })
        )
      )
      .leftJoinAndSelect("user.account", "account")
      .getOne();

    if (!user) {
      throw new NotFoundException(USER_NOT_EXISTS);
    }
    return user;
  }

  async findActiveByEmail(email: string): Promise<User> {
    return this.userQueryBuilder
      .createQueryBuilder(USER_ALIAS)
      .where("LOWER(user.email) = LOWER(:email)", { email })
      .andWhere("user.status = :status", { status: EUserStatus.ACTIVE })
      .leftJoinAndSelect("user.account", "account")
      .getOne();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userQueryBuilder
      .createQueryBuilder(USER_ALIAS)
      .where("LOWER(email) = LOWER(:email)", { email })
      .leftJoinAndSelect("user.account", "account")
      .getOne();
  }

  findDriverByIdWithRideOptions(id: string, { organizationId }: User): Promise<User> {
    return this.findOne({
      where: { id, organizationId },
      relations: ["rideOptions", "account"],
      loadEagerRelations: false
    });
  }

  async findDriverAndIsRidesAssigned(id: string, currentUser: User): Promise<[User, boolean]> {
    const where: FindOptionsWhere<User> = { id, role: ERole.DRIVER };
    if (currentUser.role !== ERole.SUPER_ADMIN) {
      where.organizationId = currentUser.organizationId;
    }
    const driver = await this.findOne({ where });
    const ride = await this.dataSource.getRepository(RideEntity).findOneBy({
      driver: {
        id
      },
      status: In([ERideStatus.ACCEPTED, ERideStatus.IN_PROGRESS])
    });

    return [driver, !!ride];
  }

  async findUserByPhoneEmail(userContact: string) {
    try {
      return this.userQueryBuilder
      .createQueryBuilder(USER_ALIAS)
      .orWhere({ phoneNumber: userContact })
      .orWhere({ email: userContact })
      .getOne();
    }
    catch (err) {
      console.log('findUserByPhoneEmail', err);
      return null;
    }
  }
}
