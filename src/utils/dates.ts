import {
    DayInMilliseconds,
    MinuteInMilliseconds,
    NOT_SPECIFIED,
    SecondInMilliseconds,
    WeekInMilliseconds
  } from "./constants";

  import { EUSTimezones } from "src/auth/enums/timezones.enum";
  
  export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  export function generateDateRange(fromDate: number, toDate: number): { from: Date; to: Date } {
    const to = new Date(toDate);
    const from = new Date(fromDate);
    return { from, to };
  }
  
  export function getDateString(datetime: Date): string {
    if (typeof datetime !== "string") {
      const y = datetime?.getUTCFullYear();
      const m = datetime?.getUTCMonth() + 1 < 10 ? `0${datetime?.getUTCMonth() + 1}` : datetime?.getUTCMonth() + 1;
      const d = datetime?.getUTCDate() < 10 ? `0${datetime?.getUTCDate()}` : datetime?.getUTCDate();
      return `${y}-${m}-${d}`;
    }
  
    return datetime;
  }
  
  export function getRideDateString(datetime: Date): string {
    if (typeof datetime !== "string") {
      const y = datetime?.getUTCFullYear();
      const m = datetime?.getUTCMonth() + 1 < 10 ? `0${datetime?.getUTCMonth() + 1}` : datetime?.getUTCMonth() + 1;
      const d = datetime?.getUTCDate() < 10 ? `0${datetime?.getUTCDate()}` : datetime?.getUTCDate();
  
      return `${m}/${d}/${y}`;
    }
  
    return datetime;
  }
  
  export function getPdfDate(datetime: Date): string {
    const y = datetime?.getUTCFullYear();
    const m = datetime?.getUTCMonth() + 1 < 10 ? `0${datetime?.getUTCMonth() + 1}` : datetime?.getUTCMonth() + 1;
    const d = datetime?.getUTCDate() < 10 ? `0${datetime?.getUTCDate()}` : datetime?.getUTCDate();
  
    return `${m}/${d}/${y}`;
  }
  
  export function getDateWithTzString(datetime: Date, timezone: EUSTimezones): string {
    if (typeof datetime === "string") {
      datetime = new Date(datetime);
    }
  
    return datetime.toLocaleString("en-US", {
      month: "numeric",
      year: "numeric",
      day: "numeric",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
      timeZoneName: "short"
    });
  }
  
  export function getDateWithoutTzString(datetime: Date, timezone: EUSTimezones): string {
    if (typeof datetime === "string") {
      datetime = new Date(datetime);
    }
  
    return datetime.toLocaleString("en-US", {
      month: "numeric",
      year: "numeric",
      day: "numeric",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone
    });
  }
  
  export function convertDateToString(datetime: Date): string {
    if (typeof datetime === "string") {
      datetime = new Date(datetime);
    }
  
    return datetime.toLocaleString("en-US", { month: "numeric", year: "numeric", day: "numeric" });
  }
  
  export function getDateAndTimeZoneString({ datetime, timezone }: any): { date: string; time: string } {
    if (typeof datetime === "string") {
      datetime = new Date(datetime);
    }
  
    const date = datetime ? datetime.toLocaleDateString("en-US", { timeZone: timezone }) : NOT_SPECIFIED;
    const time = datetime
      ? datetime.toLocaleTimeString("en-US", {
          timeZone: timezone,
          timeZoneName: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : NOT_SPECIFIED;
  
    return { date, time };
  }
  
  function getSameDayRange(from: Date, to: Date, timeZone: EUSTimezones) {
    if (typeof from === "string") {
      from = new Date(from);
    }
  
    if (typeof to === "string") {
      to = new Date(to);
    }
  
    const dateFrom = from.toLocaleDateString("en-US", { timeZone });
    const timeFrom = from.toLocaleTimeString("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit"
    });
  
    const timeTo = to.toLocaleTimeString("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });
  
    return `${dateFrom}, ${timeFrom} - ${timeTo}`;
  }
  
  function getDifferentDayRangeString(from: Date, to: Date, timeZone: EUSTimezones) {
    if (typeof from === "string") {
      from = new Date(from);
    }
  
    if (typeof to === "string") {
      to = new Date(to);
    }
  
    const dateFrom = getDateWithoutTzString(from, timeZone);
    const dateTo = getDateWithTzString(to, timeZone);
  
    return `${dateFrom} - ${dateTo}`;
  }
  
  export function getFormattedRangeString(from: Date, to: Date, timeZone: EUSTimezones): string {
    if (typeof from === "string") {
      from = new Date(from);
    }
  
    if (typeof to === "string") {
      to = new Date(to);
    }
  
    if (doDatesBelongToSameDay(from, to, timeZone)) {
      return getSameDayRange(from, to, timeZone);
    }
  
    return getDifferentDayRangeString(from, to, timeZone);
  }
  
  export function getLocalDateString({ datetime, timezone }: any): string {
    if (typeof datetime === "string") {
      datetime = new Date(datetime);
    }
  
    return datetime.toLocaleDateString("en-US", { timeZone: timezone });
  }
  
  export function convertToTimeZone(date: Date, tzString: string): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.toLocaleString("en-US", { timeZone: tzString }));
  }
  
  export function calcDifferenceInMinutes(toDate: Date, fromDate: Date): number {
    return Math.floor(getDateDifference(toDate, fromDate) / MinuteInMilliseconds);
  }
  
  export function getDateDifference(toDate: Date, fromDate: Date): number {
    if (toDate && !(toDate instanceof Date)) {
      toDate = new Date(toDate);
    }
  
    if (fromDate && !(fromDate instanceof Date)) {
      fromDate = new Date(fromDate);
    }
  
    return toDate.getTime() - fromDate.getTime();
  }
  
  export function areDatesEqual(toDate: Date, fromDate: Date): boolean {
    if (fromDate && typeof fromDate === "string") {
      fromDate = new Date(fromDate);
    }
  
    if (toDate && typeof toDate === "string") {
      toDate = new Date(toDate);
    }
  
    return toDate?.getTime() === fromDate?.getTime();
  }
  
  export function doesDateBelongToRange(date: Date, range: { from: Date; to: Date }): boolean {
    const checkDate: Date = new Date(date);
    checkDate.setMilliseconds(0);
    const from = new Date(range.from);
    from.setMilliseconds(0);
    const to = new Date(range.to);
    to.setMilliseconds(0);
  
    return checkDate.getTime() >= from.getTime() && checkDate.getTime() <= to.getTime();
  }
  
  export function isDateAheadMoreThanDelta(date: Date, minDeltaInMinutes = 0): boolean {
    return calcDifferenceInMinutes(date, new Date()) >= minDeltaInMinutes;
  }
  
  export function isMinutePassedFrom(date: Date): boolean {
    const now = new Date();
  
    return now.getTime() > date?.getTime() + MinuteInMilliseconds;
  }
  
  export function isToday(datetime: Date, timezone: EUSTimezones): boolean {
    const today = new Date();
  
    return doDatesBelongToSameDay(datetime, today, timezone);
  }
  
  export function doDatesBelongToSameDay(tzDateFrom: Date, tzDateTo: Date, timezone: EUSTimezones): boolean {
    const convertedFromDate = convertToTimeZone(tzDateFrom, timezone);
    const convertedToDate = convertToTimeZone(tzDateTo, timezone);
  
    return (
      convertedFromDate.getDate() === convertedToDate.getDate() &&
      convertedFromDate.getMonth() === convertedToDate.getMonth() &&
      convertedFromDate.getFullYear() === convertedToDate.getFullYear()
    );
  }
  
  export function addMinutes(date: Date, minutes: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() + minutes * MinuteInMilliseconds);
  }
  
  export function subtractMinutes(date: Date, minutes: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() - minutes * MinuteInMilliseconds);
  }
  
  export function addSeconds(date: Date, seconds: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() + seconds * SecondInMilliseconds);
  }
  
  export function addDays(date: Date, days: number): Date {
    if (!date) {
      return null;
    }
  
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() + days * DayInMilliseconds);
  }
  
  export function addWeeks(date: Date, weeks: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() + weeks * 7 * DayInMilliseconds);
  }
  
  export function subtractDaysFromNow(days: number): Date {
    return new Date(new Date().getTime() - DayInMilliseconds * days);
  }
  
  export function getWeekStart(date: Date): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    return new Date(date.getTime() - date.getDay() * DayInMilliseconds);
  }
  
  export function onSameWeek(date: Date, dateToCheck: Date): boolean {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    const weekStart = getWeekStart(date);
    weekStart.setHours(0, 0, 0, 0);
  
    const weekEnd = new Date(weekStart.getTime() + WeekInMilliseconds);
  
    return weekStart.getTime() <= dateToCheck.getTime() && dateToCheck.getTime() < weekEnd.getTime();
  }
  
  export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
  
  export function getDaysInMonth(date: Date): number {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    const month = date.getUTCMonth();
  
    return month === 1 && isLeapYear(date.getUTCFullYear()) ? 29 : MONTH_DAYS[month];
  }
  
  export function addMonths(date: Date, months: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    const n = date.getDate();
    const result = new Date(date.getTime());
    result.setDate(1);
    result.setMonth(date.getMonth() + months);
    result.setDate(Math.min(n, getDaysInMonth(result)));
  
    return result;
  }
  
  export function getNthWeekdayOfMonth(date: Date, weekDay: number, weekIndex: number): Date {
    if (typeof date === "string") {
      date = new Date(date);
    }
  
    const weekDays = [];
    const nextDate: Date = new Date(date.getTime());
    nextDate.setDate(1);
    nextDate.setDate(nextDate.getDate() + ((7 + weekDay - nextDate.getDay()) % 7));
  
    while (nextDate.getMonth() === date.getMonth()) {
      weekDays.push(new Date(nextDate.getTime()));
      nextDate.setDate(nextDate.getDate() + 7);
    }
  
    return weekDays[calculateWeekIndex(weekIndex, weekDays.length)];
  }
  
  function calculateWeekIndex(weekIndex: number, total: number) {
    if (weekIndex >= 0 && weekIndex < 3) {
      return weekIndex;
    }
  
    if (weekIndex >= 0 && weekIndex >= 3) {
      return total - 1;
    }
  
    if (weekIndex < 0) {
      return total + weekIndex;
    }
  }
  
  export function getDifferenceBetweenWeekdays(currentDayIndex: number, nextDayIndex: number): number {
    if (currentDayIndex === nextDayIndex) return 0;
    const result = currentDayIndex - nextDayIndex;
  
    return result > 0 ? 7 - result : Math.abs(result);
  }
  
  export function minutesToHoursString(timeInMinutes: number): string {
    const hours = timeInMinutes / 60;
    const fullHours = Math.floor(hours);
    const fullMinutes = Math.round((hours - fullHours) * 60);
    let hoursDisplay = "",
      minutesDisplay = "";
  
    if (fullHours > 0) {
      hoursDisplay = fullHours + (fullHours === 1 ? " hour" : " hours");
    }
  
    if (fullMinutes > 0) {
      minutesDisplay = fullMinutes + (fullMinutes === 1 ? " minute" : " minutes");
    }
  
    const joinString = hoursDisplay.length && minutesDisplay.length ? ", " : "";
  
    return hoursDisplay + joinString + minutesDisplay;
  }
  
  export function getTimeRangeForDate(date: Date, timezone: EUSTimezones): { start: Date; end: Date } {
    const convertedDate = convertToTimeZone(date, timezone);
    const start = new Date(date);
    start.setHours(date.getHours() - convertedDate.getHours(), 0, 0, 0);
    const end = new Date(date);
    const hoursToEndOfDay = 23 - convertedDate.getHours();
    end.setHours(date.getHours() + hoursToEndOfDay, 59, 59, 999);
  
    return { start, end };
  }
  
  export function getNextDateRanges(tomorrow: Date, timezone: EUSTimezones): { start: Date; end: Date } {
    const convertedDate = convertToTimeZone(tomorrow, timezone);
    const start = new Date(convertedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(convertedDate);
    end.setHours(23 + 5, 59, 59, 999);
  
    return { start, end };
  }
  
  export function calculateRideAcceptanceTime(rideCreatedAt: Date, rideTimeZone: string): number {
    const createdAt = convertToTimeZone(rideCreatedAt, rideTimeZone);
  
    return (createdAt.getTime() - new Date().getTime()) / MinuteInMilliseconds;
  }
  
  export function getNextMonthStartDate(date = new Date()) {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    date.setHours(0, 0, 0, 0);
  
    return date;
  }
  
  export function getNextMonthDueDate(noOfDays: number, date = new Date()) {
    const nextDate = getNextMonthStartDate(date);
    nextDate.setDate(noOfDays);
    nextDate.setHours(23, 59, 59, 999);
  
    return nextDate;
  }
  
  export function getFirstDayOfCurrentMonth() {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
  
    return firstDay;
  }
  
  export function getLastDayOfCurrentMonth() {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const lastDay = new Date(y, m + 1, 0);
  
    return lastDay;
  }
  
  export function getFullMonth(date) {
    return date.toLocaleString("default", { month: "long" });
  }
  
  export function getFullYear(date) {
    return date.getFullYear();
  }
  
  export function generateInvoicePath(date, tcName) {
    const year = date.getFullYear();
    const month = getFullMonth(date);
  
    return `transport-company/invoices/${year}/${month}/${tcName}/invoice.pdf`;
  }
  
  export function getFirstDayOfSelectedMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const m = date.getMonth() + 1 < 10 ? `0${date?.getMonth() + 1}` : date?.getMonth() + 1;
    const d = firstDay?.getDate() < 10 ? `0${firstDay?.getDate()}` : firstDay?.getDate();
  
    return `${m}/${d}/${year}`;
  }
  
  export function getLastDayOfSelectedMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const m = date.getMonth() + 1 < 10 ? `0${date?.getMonth() + 1}` : date?.getMonth() + 1;
    const d = lastDay?.getDate() < 10 ? `0${lastDay?.getDate()}` : lastDay?.getDate();
  
    return `${m}/${d}/${year}`;
  }
  