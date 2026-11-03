// Дата анализа в таблице. Раньше месяц форматировался жёстко как `en-US`,
// независимо от языка интерфейса (спецификация 003, FR-6).

import {Lang} from '../../../shared/lang.tsx';

// Тот же вид, что был в таблице: `21 Oct 2026` — меняется только язык месяца.
export const formatAnalyteDate = (date: Date, lang: Lang): string =>
  `${date.getDate()} ${date.toLocaleString(lang, {month: 'short'})} ${date.getFullYear()}`;
