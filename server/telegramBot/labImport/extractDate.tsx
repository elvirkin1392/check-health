// Дата анализа: из файла, если она там есть (FR-3).

import {DateTime} from 'luxon';

import {TextItem} from './extractText.tsx';

// День, месяц и год с 4 цифрами, разделитель `.`, `-` или `/`. Год ровно из
// четырёх цифр и обязательный третий компонент отсекают «№ 14-2026» из номера
// договора; границы по цифрам не дают вырезать дату из середины длинного числа.
const DATE_PATTERN = /(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?!\d)/g;

// Календарная дата `YYYY-MM-DD` — без времени и без смещения (§9).
export const extractDate = (items: TextItem[]): string | undefined => {
  // Первая дата в порядке следования — это шапка бланка; даты печати и выдачи
  // идут ниже. Фрагменты не склеиваем: дата не должна собираться из чисел
  // соседних колонок.
  for (const {str} of items) {
    for (const [, day, month, year] of str.matchAll(DATE_PATTERN)) {
      // UTC здесь только чтобы разбор не зависел от пояса сервера (в поясе
      // с переводом часов полночь может не существовать); дату это не двигает.
      const date = DateTime.fromObject(
        {year: Number(year), month: Number(month), day: Number(day)},
        {zone: 'utc'},
      );
      // 32.13.2026 luxon не нормализует, а помечает невалидной.
      if (date.isValid) return date.toISODate() ?? undefined;
    }
  }
  return undefined;
}

// Дата в будущем или абсурдно давняя — не дата анализа. `today` приходит
// снаружи, посчитанный в поясе пользователя: серверного «сейчас» здесь быть
// не должно (§9).
export const MAX_AGE_YEARS = 10;

export const isAcceptableDate = (date: string, today: string): boolean => {
  const oldest = DateTime.fromISO(today, {zone: 'utc'}).minus({years: MAX_AGE_YEARS}).toISODate();
  // Обе даты — строки `YYYY-MM-DD`, а такие строки сравниваются как даты.
  // Через DateTime и пояс их гонять нельзя: сдвиг на сутки (§9).
  return oldest !== null && date >= oldest && date <= today;
}
