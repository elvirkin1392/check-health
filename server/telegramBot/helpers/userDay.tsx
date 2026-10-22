// Какой сегодня календарный день у конкретного человека.
//
// Сервер на Cloud Run живёт в UTC, поэтому `dt.now()` отвечает на вопрос
// «какой день на сервере», а не «какой день у пользователя». Для всего,
// что измеряется днями (начало и конец болезни, «сегодня», статистика),
// нужен второй ответ — конституция §9.
//
// Возвращаются календарные строки `YYYY-MM-DD` без смещения: день болезни —
// это утверждение о календаре, а не момент времени.

export const userToday = (_timeZone?: string | null): string => {
  throw new Error('not implemented');
}

export const userYesterday = (_timeZone?: string | null): string => {
  throw new Error('not implemented');
}

export const userTodayMonth = (_timeZone?: string | null): {year: number, month: number} => {
  throw new Error('not implemented');
}
