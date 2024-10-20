export const SecondInMilliseconds = 1000;
export const MinuteInSeconds = 60;
export const HourInSeconds = MinuteInSeconds * 60;
export const HourInMinutes = 60;
export const DayInMinutes = HourInMinutes * 24;
export const DayInSeconds = HourInSeconds * 24;
export const WaitTimeGracePeriod = 15;

export const MinuteInMilliseconds = MinuteInSeconds * SecondInMilliseconds;
export const HourInMilliseconds = HourInSeconds * SecondInMilliseconds;
export const DayInMilliseconds = DayInSeconds * SecondInMilliseconds;
export const DayLastMinInMilliseconds = DayInMilliseconds - MinuteInMilliseconds;
export const WeekInMilliseconds = DayInMilliseconds * 7;

export const NOT_SPECIFIED = '-';
export const NOT_APPLICABLE = 'N/A';
export const YES = 'yes';
export const NO = 'no';

export const BLOCKED_ACTIVITY_MESSAGE = 'Too many failed login requests. Please try again later.';
export const NUMBER_LOGIN_ATTEMPTS = 5;
export const SALT_FACTOR = 13;
export const GoogleKeyFilePath = './.creds/medhaul-app-a594e99b5c46.json';

export const AUDIT_CONNECTION = 'auditConnection';

export const MHCronExpressions = {
  EveryMondayAt7AM: '0 7 * * 1'
};

export const MidnightHours = {
  startHour: 21,
  endHour: 5
};

export const StJudeMidnightHours = {
  startHour: 23,
  endHour: 6
};

export const Languages = [
  // First values used as default
  { text: 'English', value: 'en' },
  { text: 'Afrikaans', value: 'af' },
  { text: 'Arabic', value: 'ar' },
  { text: 'Catalan', value: 'ca' },
  { text: 'Chinese', value: 'zh' },
  { text: 'Chinese (Mandarin)', value: 'zh-CN' },
  { text: 'Chinese (Cantonese)', value: 'zh-HK' },
  { text: 'Croatian', value: 'hr' },
  { text: 'Czech', value: 'cs' },
  { text: 'Danish', value: 'da' },
  { text: 'Dutch', value: 'nl' },
  { text: 'English (British)', value: 'en-GB' },
  { text: 'Finnish', value: 'fi' },
  { text: 'French', value: 'fr' },
  { text: 'German', value: 'de' },
  { text: 'Greek', value: 'el' },
  { text: 'Hebrew', value: 'he' },
  { text: 'Hindi', value: 'hi' },
  { text: 'Hungarian', value: 'hu' },
  { text: 'Indonesian', value: 'id' },
  { text: 'Italian', value: 'it' },
  { text: 'Japanese', value: 'ja' },
  { text: 'Korean', value: 'ko' },
  { text: 'Malay', value: 'ms' },
  { text: 'Norwegian', value: 'nb' },
  { text: 'Polish', value: 'pl' },
  { text: 'Portuguese - Brazil', value: 'pt-BR' },
  { text: 'Portuguese', value: 'pt' },
  { text: 'Romanian', value: 'ro' },
  { text: 'Russian', value: 'ru' },
  { text: 'Spanish', value: 'es' },
  { text: 'Swedish', value: 'sv' },
  { text: 'Tagalog', value: 'tl' },
  { text: 'Thai', value: 'th' },
  { text: 'Turkish', value: 'tr' },
  { text: 'Vietnamese', value: 'vi' }
];
