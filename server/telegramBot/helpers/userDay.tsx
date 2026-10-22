// Какой сегодня календарный день у конкретного человека.
//
// Сервер на Cloud Run живёт в UTC, поэтому `dt.now()` отвечает на вопрос
// «какой день на сервере», а не «какой день у пользователя». Для всего,
// что измеряется днями (начало и конец болезни, «сегодня», статистика),
// нужен второй ответ — конституция §9.
//
// Возвращаются календарные строки `YYYY-MM-DD` без смещения: день болезни —
// это утверждение о календаре, а не момент времени.

import {DateTime as dt} from "luxon";
import {resolveTimeZone} from './reminderSchedule';

const now = (timeZone?: string | null) => dt.now().setZone(resolveTimeZone(timeZone));

export const userToday = (timeZone?: string | null): string =>
  now(timeZone).toISODate()!;

export const userYesterday = (timeZone?: string | null): string =>
  now(timeZone).minus({days: 1}).toISODate()!;

export const userTodayMonth = (timeZone?: string | null): {year: number, month: number} => {
  const {year, month} = now(timeZone);
  return {year, month};
}
