import { add, format, parse, startOfDay } from "date-fns";

export const formatTimeSlot = (timeInSeconds) => {
  return format(
    new Date().setHours(Math.floor(timeInSeconds / 3600), 0, 0),
    "h:mm a"
  );
};

export const isToday = (date) => {
  const today = new Date();

  if (today.toDateString() === date.toDateString()) {
    return true;
  }

  return false;
};

export const getCurrentTimeInSeconds = (date) => {
  let isTodayDate = isToday(date);

  const now = isTodayDate
    ? new Date().setHours(new Date().getHours(), 0, 0, 0)
    : new Date(date).setHours(9, 0, 0, 0);
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0); // Set to midnight

  const timeDifferenceInSeconds = (now - midnight) / 1000;

  return Math.floor(timeDifferenceInSeconds);
};

export const getHourFromSeconds = (seconds) => {
  var hours = Math.floor(seconds / 3600);
  return hours;
};
