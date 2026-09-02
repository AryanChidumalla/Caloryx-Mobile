/**
 * Date utility functions for local time zone date manipulation.
 * Formats dates strictly in 'YYYY-MM-DD' representation to prevent timezone drift.
 */

export function getTodayDateString(): string {
  return formatLocalDate(new Date());
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 12, 0, 0, 0); // Noon to prevent DST shift
}

export function addDays(dateString: string, days: number): string {
  const d = parseLocalDate(dateString);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

export function isYesterday(dateString: string): boolean {
  return dateString === addDays(getTodayDateString(), -1);
}

export function isTomorrow(dateString: string): boolean {
  return dateString === addDays(getTodayDateString(), 1);
}

export function isFuture(dateString: string): boolean {
  return dateString > getTodayDateString();
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FULL_WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatDateForDisplay(dateString: string): string {
  if (isToday(dateString)) {
    const d = parseLocalDate(dateString);
    return `Today, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }
  if (isYesterday(dateString)) {
    const d = parseLocalDate(dateString);
    return `Yesterday, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }
  if (isTomorrow(dateString)) {
    const d = parseLocalDate(dateString);
    return `Tomorrow, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }

  const d = parseLocalDate(dateString);
  const weekday = WEEKDAY_NAMES[d.getDay()];
  const month = MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
    return `${weekday}, ${month} ${day}`;
  }
  return `${month} ${day}, ${year}`;
}

export function formatFullDate(dateString: string): string {
  const d = parseLocalDate(dateString);
  const weekday = FULL_WEEKDAY_NAMES[d.getDay()];
  const month = FULL_MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}

export function getShortMonthDay(dateString: string): string {
  const d = parseLocalDate(dateString);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}
