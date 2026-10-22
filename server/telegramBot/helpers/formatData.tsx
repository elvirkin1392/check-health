import {DateTime as dt} from "luxon";

// Второй аргумент — сегодняшний день пользователя (спецификация 002, FR-6, FR-7).
// Пока не используется: тело перейдёт на него в фазе реализации.
export const extractPeriodsFromYear = (periods, _today?: string) => {
  const dayYearAgo = dt.now().minus({year: 1});
  let result = 365;

  for (let i = periods.length - 1; i >= 0; i--) {
    const start = dt.fromISO(periods[i].start_date);
    const end = periods[i].end_date ? dt.fromISO(periods[i].end_date) : dt.now();

    if (start >= dayYearAgo && end >= dayYearAgo) {
      const diffDays = calcPeriodBetweenDates(start, end).days || 1;
      result = result - diffDays;
    }

    if (start < dayYearAgo && end >= dayYearAgo) {
      const diffDays = calcPeriodBetweenDates(dayYearAgo, end).days || 1;
      result = result - diffDays;
      return result;
    }
  }

  return result;
}

export const calcPeriodBetweenDates = (start, end) => {
  const startDt = dt.fromISO(start).toISODate();
  const endDt = dt.fromISO(end).toISODate();
  return dt.fromISO(endDt).diff(dt.fromISO(startDt), ['days']).toObject();
}