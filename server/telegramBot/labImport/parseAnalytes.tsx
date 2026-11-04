// Разбор извлечённых фрагментов в показатели. Чистая функция: ни PDF,
// ни Telegram, ни базы (§4).

import {TextItem} from './extractText.tsx';

export type ParsedRow = {
  code?: string,
  name: string,
  // Строка, а не число: «отрицательно», «следы», «<0.5» — тоже результаты.
  value: string,
  unit?: string,
  normal?: {from?: number, to?: number, raw?: string},
};

// Нераспознанное не теряется молча, а показывается человеку отдельно (FR-9).
export type ParseResult = {rows: ParsedRow[], unparsed: string[]};

export const parseAnalytes = (_items: TextItem[]): ParseResult => {
  throw new Error('not implemented');
}
