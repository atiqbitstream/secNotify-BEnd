import DatabaseConfig from './database.config';
import { DayInSeconds, HourInSeconds } from '../utils/constants';

export const config = () => ({
  frontUrl: process.env.FRONT_URL,
  environment: process.env.NODE_ENV,
  google: {
    recaptchaSiteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    testPhoneNumbers: process.env.TEST_PHONE_NUMBERS
  },
  postgres: { ...DatabaseConfig() },
  mail: {
    userEmail: process.env.EMAIL_USER
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: HourInSeconds,
    refreshExpiration: DayInSeconds
  }
});
