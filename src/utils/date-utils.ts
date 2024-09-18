import { formatDate } from "@openmrs/esm-framework";
import dayjs from "dayjs";

export const today = () => {
  var date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const DATE_PICKER_CONTROL_FORMAT = "Y-m-d";

export const DATE_PICKER_FORMAT = "YYYY-MM-DD";

const DATE_ONLY_TRANSFER_FORMAT = "YYYY-MM-DD";

export const formatDisplayDate = (
  date: Date | null | undefined | string,
  format?: string
) => {
  return date ? dayjs(date).format(format ?? "DD-MMM-YYYY") : "";
};
export const formatDisplayDateTime = (
  date: Date | null | undefined | string,
  format?: string
) => {
  return date ? dayjs(date).format(format ?? "DD-MMM-YYYY HH:mm:ss") : "";
};

export const formatForDatePicker = (date: Date | null | undefined | string) => {
  return formatDisplayDate(date, DATE_PICKER_FORMAT);
};

export const formatAsPlainDateForTransfer = (
  date: Date | null | undefined | any
) => {
  return formatDisplayDate(date, DATE_ONLY_TRANSFER_FORMAT);
};

export const formatAsPlainEndOfDayDateForTransfer = (
  date: Date | null | undefined | any
) => {
  if (date) {
    return formatDisplayDate(date, DATE_ONLY_TRANSFER_FORMAT) + "T23:59:59.999";
  }
  return "";
};

const MINUTE = 60000;
const DAY = 86400000;
const WEEK = 604800000; // = 7 * 24 * 60 * 60 * 1000 = 7 days in ms

const tzDiff = (first, second) =>
  (first.getTimezoneOffset() - second.getTimezoneOffset()) * MINUTE;

export const weekNumber = (date = new Date()) => {
  // day 0 is monday
  const day = (date.getDay() + 6) % 7;
  // get thursday of present week
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - day + 3);
  // set 1st january first
  const firstThursday = new Date(thursday.getFullYear(), 0, 1);
  // if Jan 1st is not a thursday...
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(
      0,
      1 + ((11 /* 4 + 7 */ - firstThursday.getDay()) % 7)
    );
  }

  const weekOfYear =
    1 +
    Math.floor(
      (thursday.getTime() -
        firstThursday.getTime() +
        tzDiff(firstThursday, thursday)) /
        WEEK
    );
  return weekOfYear;
};

export const getDateOfIsoWeek = (week, year): Date => {
  week = parseFloat(week);
  year = parseFloat(year);

  if (week < 1 || week > 53) {
    throw new RangeError("ISO 8601 weeks are numbered from 1 to 53");
  } else if (!Number.isInteger(week)) {
    throw new TypeError("Week must be an integer");
  } else if (!Number.isInteger(year)) {
    throw new TypeError("Year must be an integer");
  }

  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay();
  const isoWeekStart = simple;

  // Get the Monday past, and add a week if the day was
  // Friday, Saturday or Sunday.

  isoWeekStart.setDate(simple.getDate() - dayOfWeek + 1);
  if (dayOfWeek > 4) {
    isoWeekStart.setDate(isoWeekStart.getDate() + 7);
  }

  // The latest possible ISO week starts on December 28 of the current year.
  if (
    isoWeekStart.getFullYear() > year ||
    (isoWeekStart.getFullYear() == year &&
      isoWeekStart.getMonth() == 11 &&
      isoWeekStart.getDate() > 28)
  ) {
    throw new RangeError(`${year} has no ISO week ${week}`);
  }

  return isoWeekStart;
};

export const formatDateForDisplay = (date: Date | null | undefined) => {
  return date ? formatDate(dayjs(date).toDate(), { time: false }) : "";
};

export const formatDateTimeForDisplay = (date: Date | null | undefined) => {
  return date ? formatDate(dayjs(date).toDate(), { time: true }) : "";
};
