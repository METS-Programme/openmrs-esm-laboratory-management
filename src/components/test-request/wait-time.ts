import dayjs from "dayjs";

export const calculateWaitTime = (
  dateStarted: Date,
  dateCompleted: Date | null | undefined
) => {
  if (!dateStarted) return null;
  if (!dateCompleted) {
    dateCompleted = new Date();
  }
  let timeDifference =
    dayjs(dateCompleted).toDate().getTime() -
    dayjs(dateStarted).toDate().getTime();
  return timeDifference;
};

export const formatWaitTime = (
  timeDifference: number,
  translator: (key: string, defaultValue: string) => string
) => {
  // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds = 86400000 milliseconds
  let years = Math.floor(timeDifference / (365 * 86400000));
  timeDifference = timeDifference - years * 365 * 86400000;
  let days = Math.floor(timeDifference / 86400000);
  timeDifference = timeDifference - days * 86400000;
  let hours = Math.floor(timeDifference / 3600000);
  timeDifference = timeDifference - hours * 3600000;
  let minutes = Math.floor(timeDifference / 60000);
  if (years == 0 && days == 0 && hours == 0 && minutes == 0) {
    return "0m";
  }
  return [
    years > 0 ? `${years}${translator("yearShortLetter", "y")}` : null,
    days > 0 ? `${days}${translator("dayShortLetter", "d")}` : null,
    hours > 0 ? `${hours}${translator("hourShortLetter", "h")}` : null,
    minutes > 0 ? `${minutes}${translator("minuteShortLetter", "m")}` : null,
  ]
    .filter((p) => p)
    .join(" ");
};

export const getWaitTime = (
  dateStarted: Date,
  dateCompleted: Date | null | undefined,
  translator: (key: string, defaultValue: string) => string
) => {
  let timeDifference = calculateWaitTime(dateStarted, dateCompleted);
  if (timeDifference) return formatWaitTime(timeDifference, translator);
  return null;
};
