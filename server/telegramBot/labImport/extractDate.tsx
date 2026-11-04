// Дата анализа: из файла, если она там есть (FR-3).

import {TextItem} from './extractText.tsx';

// Календарная дата `YYYY-MM-DD` — без времени и без смещения (§9).
export const extractDate = (_items: TextItem[]): string | undefined => {
  throw new Error('not implemented');
}

// Дата в будущем или абсурдно давняя — не дата анализа. `today` приходит
// снаружи, посчитанный в поясе пользователя: серверного «сейчас» здесь быть
// не должно (§9).
export const MAX_AGE_YEARS = 10;

export const isAcceptableDate = (_date: string, _today: string): boolean => {
  throw new Error('not implemented');
}
