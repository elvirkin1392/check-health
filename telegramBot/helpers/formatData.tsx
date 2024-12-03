import {DateTime as dt} from "luxon";

export const extractPeriodsFromYear = (periods) => {
  const dayYearAgo = dt.now().minus({year: 1});
  let result = 365;

  for (let i = periods.length - 1; i >= 0; i--) {
    const start = dt.fromISO(periods[i].start_date);
    const end = periods[i].end_date ? dt.fromISO(periods[i].end_date) : dt.now();
    if (start >= dayYearAgo && end >= dayYearAgo) {
      const diffDays = calcPeriodBetweenDates(start, end).days + 1;
      result = result - diffDays;
    }
    if (start < dayYearAgo && end >= dayYearAgo) {
      const diffDays = calcPeriodBetweenDates(dayYearAgo, end).days + 1;
      result = result - diffDays;
    }
  }

  return result;
}

export const calcPeriodBetweenDates = (start, end) => {
  return dt.fromISO(end).diff(dt.fromISO(start), ['days', 'hours']).toObject();
}