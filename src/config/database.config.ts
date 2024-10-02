import { PlatformSettings } from '../api/platform-settings/entities/platform-settings.entity';
import { Counter } from '../api/counter/entities/counter.entity';
import { User } from '../api/users/entities/user.entity';
import { Token } from '../api/auth/entities/token.entity';
import { Account } from '../api/auth/entities/account.entity';
import { Password2fa } from '../api/auth/entities/password2fa.entity';
import { CustomRideFilters } from '../api/custom-ride-filters/entities/custom-ride-filters.entity';
import { RideOption } from '../api/ride-options/entities/ride-option.entity';
import { Region } from '../api/states/entities/region.entity';
import { Organization } from '../api/organization/entities/organization.entity';
import { HealthOrganizationEntity } from '../api/health-organizations/entities/health-organization.entity';
import { TransportCompanyEntity } from '../api/transport-company/entities/transport-company.entity';
import { RideDraftEntity } from '../api/ride-drafts/entities/ride-drafts.entity';
import { RideEntity } from '../api/ride-requests/entities/ride-request.entity';
import { TcRidesStatuses } from '../api/ride-requests/entities/tc-rides-statuses.entity';
import { RideHistoryEntity } from '../api/ride-history/entities/ride-history.entity';
import { RecurrenceRuleEntity } from '../api/schedule/entities/recurrence-rule.entity';
import { PatientEntity } from '../api/patient/entities/patient.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SystemNotificationRecordEntity } from '../system-notification-records/entities/system-notification-records.entity';
import { HoInvoiceEntity } from '../api/ho-invoice/entities/ho-invoice.entity';
import { HoPricingEntity } from '../api/ho-pricing/entities/ho-pricing.entity';
import { RideReceiptEntity } from '../api/ride-receipt/entities/ride-receipt.entity';
import { PublicHolidayEntity } from '../api/public-holidays/entities/public-holiday.entity';
import { RideChangeRequestEntity } from '../api/ride-change-request/entities/ride-change-request.entity';
import { RideRemindersEntity } from '../ride-reminders/entities/ride-reminder.entity';
import { TransportInvoiceEntity } from '../api/transport-invoice/entities/transport-invoice.entity';
import { TransportPricingEntity } from '../api/transport-pricing/entities/transport-pricing.entity';
import { TransportReceiptEntity } from '../api/transport-receipt/entities/transport-receipt.entity';

const DatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  //TODO: Update missing entities
  entities: [
    Account,
    RideOption,
    Counter,
    CustomRideFilters,
    HoInvoiceEntity,
    HoPricingEntity,
    Organization,
    HealthOrganizationEntity,
    TransportCompanyEntity,
    Password2fa,
    PatientEntity,
    PlatformSettings,
    PublicHolidayEntity,
    RecurrenceRuleEntity,
    Region,
    RideChangeRequestEntity,
    RideDraftEntity,
    RideHistoryEntity,
    RideReceiptEntity,
    RideRemindersEntity,
    RideEntity,
    SystemNotificationRecordEntity,
    TransportInvoiceEntity,
    TransportPricingEntity,
    TransportReceiptEntity,
    TcRidesStatuses,
    Token,
    User,
  ],
  autoLoadEntities: true,
  migrationsTableName: 'migrations',
  migrations: process.env.NODE_ENV === 'local' ? ['src/migrations'] : ['dist/src/migrations/*.js'],
  keepConnectionAlive: process.env.NODE_ENV === 'test',
  logging: true
});

export default DatabaseConfig;
