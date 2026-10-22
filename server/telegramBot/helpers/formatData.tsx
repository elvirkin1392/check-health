import {DateTime as dt} from "luxon";
import {IllPeriod} from "../../db/templates/UserTemplate.tsx";

// `today` — сегодняшний календарный день пользователя (§9). Серверного «сейчас»
// здесь нет намеренно: на Cloud Run это UTC, и у человека восточнее граница года
// и конец незакрытого периода уехали бы на сутки.
export const extractPeriodsFromYear = (periods: IllPeriod[], today: string): number => {
  const dayYearAgo = dt.fromISO(today).minus({year: 1}).toISODate();
  let result = 365;

  for (let i = periods.length - 1; i >= 0; i--) {
    const start = periods[i].start_date;
    // Незакрытый период длится по сегодняшний день пользователя.
    const end = periods[i].end_date || today;

    // Календарные даты вида `YYYY-MM-DD` сравниваются как строки: это тот же
    // порядок, что и хронологический, и никакого пояса для него не нужно.
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

// Обе даты — календарные строки. `DateTime` сюда не передаётся: прогонять
// сохранённую дату через пояс нельзя, она уедет на сутки (§9).
export const calcPeriodBetweenDates = (start: string, end: string) => {
  const startDt = dt.fromISO(start).toISODate();
  const endDt = dt.fromISO(end).toISODate();
  return dt.fromISO(endDt).diff(dt.fromISO(startDt), ['days']).toObject();
}
