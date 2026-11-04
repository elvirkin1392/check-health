// Сообщение с результатом разбора: что распознано, что нет.
// Чистая функция — ни Telegram, ни базы (§4).

import {Lang} from '../i18n/index.tsx';
import {ParsedRow} from './parseAnalytes.tsx';

// Телеграм обрывает сообщение длиннее этого; список показателей бывает длинным,
// и конец терять нельзя (§11).
export const MESSAGE_LIMIT = 4096;

export type Summary = {rows: ParsedRow[], unparsed: string[], date?: string};

// Одно сообщение или несколько, если список не влез.
export const formatSummary = (_summary: Summary, _lang: Lang): string[] => {
  throw new Error('not implemented');
}
