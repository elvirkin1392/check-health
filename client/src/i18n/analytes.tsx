// Подписи медицинских показателей.
//
// Показатель опознаётся кодом, а не строкой в данных: только по коду его можно
// подписать на двух языках. Неизвестный код — не ошибка: в файле из лаборатории
// встретится что угодно, и такая строка выводится как записана (спецификация 003,
// FR-10; разбор файлов — спецификация 004).

import {Lang} from '../../../shared/lang.tsx';

export type Analyte = {code?: string, name: string};

const ANALYTES: Record<string, Record<Lang, string>> = {
  vitamin_d: {en: 'Vitamin D', ru: 'Витамин D'},
  bilirubin: {en: 'Bilirubin', ru: 'Билирубин'},
  creatinine: {en: 'Creatinine', ru: 'Креатинин'},
};

// Пустое название без известного кода не должно давать пустую подпись.
const EMPTY_LABEL = '—';

export const analyteLabel = (analyte: Analyte, lang: Lang): string => {
  const known = analyte.code !== undefined && Object.prototype.hasOwnProperty.call(ANALYTES, analyte.code)
    ? ANALYTES[analyte.code]
    : undefined;
  return known?.[lang] ?? (analyte.name || EMPTY_LABEL);
}
