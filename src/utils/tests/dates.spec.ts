import {
  addMinutes,
  addMonths,
  addSeconds,
  areDatesEqual,
  calcDifferenceInMinutes,
  convertToTimeZone,
  generateDateRange,
  getDateAndTimeZoneString,
  getDateDifference,
  getDifferenceBetweenWeekdays,
  getDateWithTzString,
  getNthWeekdayOfMonth,
  getTimeRangeForDate,
  isDateAheadMoreThanDelta,
  isMinutePassedFrom,
  isToday,
  minutesToHoursString,
  onSameWeek,
  subtractDaysFromNow,
  getFormattedRangeString
} from '../dates';
import { EUSTimezones } from '../../enums/timezones.enum';
import { EWeekDays } from '../../enums/dates.enum';
import { DayInMilliseconds, MinuteInMilliseconds, SecondInMilliseconds } from '../constants';

const date = new Date('2021-07-23T13:30:19.460Z');

describe('Dates helper', () => {
  describe('minutesToHoursString', () => {
    it('should return hours count if minutes represent whole hours', () => {
      expect(minutesToHoursString(60)).toEqual('1 hour');
      expect(minutesToHoursString(120)).toEqual('2 hours');
    });
    it('should return minutes count if minutes number is less than 1 hour', () => {
      expect(minutesToHoursString(10)).toEqual('10 minutes');
      expect(minutesToHoursString(16)).toEqual('16 minutes');
      expect(minutesToHoursString(16.5)).toEqual('17 minutes');
    });
    it('should return hours and minutes count if minutes number is more than 1 hour', () => {
      expect(minutesToHoursString(65)).toEqual('1 hour, 5 minutes');
      expect(minutesToHoursString(159)).toEqual('2 hours, 39 minutes');
    });
  });

  describe('generateDateRange', () => {
    it('should generate date range', () => {
      const fromTimestamp = 1626555600000;
      const toTimestamp = 1627160399999;

      const from = new Date(fromTimestamp);
      const to = new Date(toTimestamp);

      const result = generateDateRange(fromTimestamp, toTimestamp);
      expect(result).toMatchObject({ from: expect.any(Date), to: expect.any(Date) });
      expect(result.from.toISOString()).toEqual(from.toISOString());
      expect(result.to.toISOString()).toEqual(to.toISOString());
    });
  });

  describe('getFormattedTzDateString', () => {
    it('should return formatted date string for CST', () => {
      const result = getDateWithTzString(date, EUSTimezones.CST);
      expect(result).toEqual('7/23/2021, 08:30 AM CDT');
    });
  });

  describe('getDateAndTimeZoneString', () => {
    it('should return formatted date string for CST', () => {
      const result = getDateAndTimeZoneString({ datetime: date, timezone: EUSTimezones.CST });
      expect(result).toEqual({ date: '7/23/2021', time: '08:30 AM CDT' });
    });
  });

  describe('getFormattedRangeString', () => {
    it('should return short range if dates belong to same day', () => {
      const date1 = new Date('2021-07-23T13:30:19.460Z');
      const date2 = new Date('2021-07-23T16:30:19.460Z');
      const timezone = EUSTimezones.CST;
      const result = getFormattedRangeString(date1, date2, timezone);
      expect(result).toEqual('7/23/2021, 08:30 AM - 11:30 AM CDT');
    });
    it('should return full range if dates belong to different days', () => {
      const date1 = new Date('2021-07-22T13:30:19.460Z');
      const date2 = new Date('2021-07-23T16:30:19.460Z');
      const timezone = EUSTimezones.CST;
      const result = getFormattedRangeString(date1, date2, timezone);
      expect(result).toEqual('7/22/2021, 08:30 AM - 7/23/2021, 11:30 AM CDT');
    });
  });

  describe('convertToTimeZone', () => {
    it('should convert date to time zone', () => {
      const result = convertToTimeZone(date, EUSTimezones.CST);
      expect(result.toISOString()).toEqual(new Date('7/23/2021, 8:30:19 AM').toISOString());
    });
  });

  describe('calcDifferenceInMinutes', () => {
    it('should return 0', () => {
      const fromDate = new Date('2021-07-23T13:30:00.460Z');
      const toDate = new Date('2021-07-23T13:30:59.460Z');

      const result = calcDifferenceInMinutes(toDate, fromDate);
      expect(result).toEqual(0);
    });
    it('if difference is less than 0 should return negative value', () => {
      const fromDate = new Date('2021-07-23T16:30:00.460Z');
      const toDate = new Date('2021-07-23T13:30:59.460Z');
      const result = calcDifferenceInMinutes(toDate, fromDate);
      expect(result).toEqual(-180);
    });
    it('should return 1', () => {
      const fromDate = new Date('2021-07-23T13:30:00.460Z');
      const toDate = new Date('2021-07-23T13:31:00.460Z');

      const result = calcDifferenceInMinutes(toDate, fromDate);
      expect(result).toEqual(1);
    });
    it('should round result to smaller number', () => {
      const fromDate = new Date('2021-07-23T13:30:00.460Z');
      const toDate = new Date('2021-07-23T13:32:50.460Z');

      const result = calcDifferenceInMinutes(toDate, fromDate);
      expect(result).toEqual(2);
    });
  });

  describe('getDateDifference', () => {
    it('should return 30000 milliseconds', () => {
      const fromDate = new Date('2021-07-23T13:30:00.460Z');
      const toDate = new Date('2021-07-23T13:30:30.460Z');

      const result = getDateDifference(toDate, fromDate);
      expect(result).toEqual(30000);
    });
  });

  describe('areDatesEqual', () => {
    it('should return false', () => {
      const fromDate = new Date('2021-07-23T13:30:00.460Z');
      const toDate = new Date('2021-07-23T13:30:30.460Z');
      const result = areDatesEqual(toDate, fromDate);
      expect(result).toEqual(false);
    });
    it('should return true', () => {
      const dateString = '2021-07-23T13:30:00.460Z';
      const fromDate = new Date(dateString);
      const toDate = new Date(dateString);

      const result = areDatesEqual(toDate, fromDate);
      expect(result).toEqual(true);
    });
  });

  describe('isDateAheadMoreThanDelta', () => {
    const minDifference = 60;

    it('should return false', () => {
      const datetime = new Date();
      const result = isDateAheadMoreThanDelta(datetime, minDifference);
      expect(result).toEqual(false);
    });

    it('should return true', () => {
      const datetime = new Date(new Date().getTime() + minDifference * MinuteInMilliseconds);
      const result = isDateAheadMoreThanDelta(datetime, minDifference);
      expect(result).toEqual(true);
    });
  });

  describe('isMinutePassedFrom', () => {
    it('should return false', () => {
      const datetime = new Date();
      const result = isMinutePassedFrom(datetime);
      expect(result).toEqual(false);
    });

    it('should return true', () => {
      const datetime = new Date(new Date().getTime() - 1.1 * MinuteInMilliseconds);
      const result = isMinutePassedFrom(datetime);
      expect(result).toEqual(true);
    });

    it('should return false if date is undefined', () => {
      const result = isMinutePassedFrom(undefined);
      expect(result).toEqual(false);
    });
  });

  describe('isToday', () => {
    it('should return true', () => {
      const datetime = new Date();
      const result = isToday(datetime, EUSTimezones.CST);
      expect(result).toEqual(true);
    });

    it('should return false', () => {
      const datetime = new Date(new Date().getTime() + DayInMilliseconds);
      const result = isToday(datetime, EUSTimezones.CST);
      expect(result).toEqual(false);
    });
  });

  describe('addMinutes', () => {
    it('should return date with added minutes', () => {
      const datetime = new Date();
      const minutesToAdd = 3;
      const result = addMinutes(datetime, minutesToAdd);
      expect(result.getTime() - datetime.getTime()).toEqual(minutesToAdd * MinuteInMilliseconds);
    });
  });

  describe('addSeconds', () => {
    it('should return date with added seconds', () => {
      const datetime = new Date();
      const secondsToAdd = 3;
      const result = addSeconds(datetime, secondsToAdd);
      expect(result.getTime() - datetime.getTime()).toEqual(secondsToAdd * SecondInMilliseconds);
    });
  });

  describe('subtractDaysFromNow', () => {
    it('should return date with subtracted days', () => {
      const datetime = new Date();
      const daysToSubtract = 3;
      const result = subtractDaysFromNow(daysToSubtract);
      const diffTime = Math.abs(datetime.getTime() - result.getTime());
      const diffDays = Math.ceil(diffTime / DayInMilliseconds);
      expect(diffDays).toEqual(3);
    });
  });

  describe('onSameWeek', () => {
    it('should return false if dates belong to different weeks', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2021-12-05T16:40:18.722Z');
      const result = onSameWeek(date1, date2);
      expect(result).toEqual(false);
    });

    it('should return true if dates belong to same week', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2021-12-04T16:40:18.722Z');
      const result = onSameWeek(date1, date2);
      expect(result).toEqual(true);
    });
  });

  describe('addMonths', () => {
    it('should return next month with same day', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2022-01-03T16:40:18.722Z');
      const result = addMonths(date1, 1);
      expect(result).toEqual(date2);
    });

    it('should return date in 2 months with same day', () => {
      const date1 = new Date('2021-12-31T16:40:18.722Z');
      const date2 = new Date('2022-02-28T16:40:18.722Z');
      const result = addMonths(date1, 2);
      expect(result).toEqual(date2);
    });
  });

  describe('getNthWeekdayOfMonth', () => {
    it('should return 2nd Monday of Month', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2021-12-13T16:40:18.722Z');
      const result = getNthWeekdayOfMonth(date1, EWeekDays.Monday, 1);
      expect(result).toEqual(date2);
    });

    it('should return last Monday of Month', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2021-12-27T16:40:18.722Z');
      const result = getNthWeekdayOfMonth(date1, EWeekDays.Monday, -1);
      expect(result).toEqual(date2);
    });

    it('should return last Monday of Month if index is set to 5', () => {
      const date1 = new Date('2021-12-03T16:40:18.722Z');
      const date2 = new Date('2021-12-27T16:40:18.722Z');
      const result = getNthWeekdayOfMonth(date1, EWeekDays.Monday, 5);
      expect(result).toEqual(date2);
    });
  });

  describe('getDifferenceBetweenWeekdays', () => {
    it('should return 3 (from Friday to Monday)', () => {
      const result = getDifferenceBetweenWeekdays(EWeekDays.Friday, EWeekDays.Monday);
      expect(result).toEqual(3);
    });

    it('should return 4 (from Monday to Friday)', () => {
      const result = getDifferenceBetweenWeekdays(EWeekDays.Monday, EWeekDays.Friday);
      expect(result).toEqual(4);
    });

    it('should return 0 when it`s the same day index', () => {
      const result = getDifferenceBetweenWeekdays(EWeekDays.Monday, EWeekDays.Monday);
      expect(result).toEqual(0);
    });
  });

  describe('getTimeRangeForDate', () => {
    function testDateRange(date: Date) {
      const result = getTimeRangeForDate(date, EUSTimezones.CST);
      expect(result.start.toISOString()).toEqual('2021-12-04T06:00:00.000Z');
      expect(result.end.toISOString()).toEqual('2021-12-05T05:59:59.999Z');
    }

    it('should return same range, even if for UTC its different dates', () => {
      testDateRange(new Date('2021-12-04T15:00:18.722Z'));
      testDateRange(new Date('2021-12-05T01:00:18.722Z'));
      testDateRange(new Date('2021-12-05T00:00:00.000Z'));
    });
  });
});
