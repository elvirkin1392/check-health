// Что показать в строке таблицы анализов.
//
// Две вещи, которые видны только на настоящих данных: нечисловой результат
// нельзя сравнивать с нормой, а предыдущее значение в других единицах —
// с текущим (спецификация 004, FR-6).

import {AnalyteResult} from '../../../shared/analytes.tsx';

// Регистр и лишние пробелы — почерк лаборатории, а не разные показатели.
const normalizeName = (name: string): string =>
  name.trim().replace(/\s+/g, ' ').toLowerCase();

// Ключ показателя: код, если он известен, иначе название из файла.
export const analyteKey = (result: AnalyteResult): string =>
  result.code ?? normalizeName(result.name);

// `Number('следы')` — NaN, а `Number('')` — 0; оба случая «числом» не считаем.
// Запятая вместо точки — обычная запись в русских бланках.
const toNumber = (value: string): number | undefined => {
  const prepared = value.trim().replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(prepared) ? Number(prepared) : undefined;
};

// `undefined` — «сравнить нельзя»: значение не число или нормы нет.
// Это не то же самое, что «вне нормы», и красить такую строку нельзя.
export const isWithinNormal = (result: AnalyteResult): boolean | undefined => {
  const value = toNumber(result.value);
  const from = result.normal?.from;
  const to = result.normal?.to;

  // Норма могла прийти только текстом (`raw`) — границ для сравнения в ней нет.
  if (value === undefined || (from === undefined && to === undefined)) return undefined;

  // Граница включается: значение ровно на ней лаборатория считает нормой.
  return (from === undefined || value >= from) && (to === undefined || value <= to);
};

// Даты — календарные строки `YYYY-MM-DD` (§9), поэтому порядок дат —
// это порядок строк, и разбирать их в `Date` ради сравнения незачем.

// Последняя более ранняя запись того же показателя в тех же единицах.
// Мкмоль/л рядом с мг/дл сравнивать нечем, поэтому при расхождении — `undefined`.
export const previousResult = (
  all: AnalyteResult[],
  current: AnalyteResult,
): AnalyteResult | undefined => {
  const key = analyteKey(current);

  return all
    // Запись той же даты предыдущей не считается: это дубль или правка, а не динамика.
    .filter(r => analyteKey(r) === key && r.unit === current.unit && r.date < current.date)
    .reduce<AnalyteResult | undefined>(
      (latest, r) => (latest === undefined || r.date >= latest.date ? r : latest),
      undefined,
    );
};

// Самое свежее значение каждого показателя — то, что попадает в таблицу.
// Порядок записей в базе не гарантирован, поэтому выбираем по дате, а не по позиции.
export const latestResults = (all: AnalyteResult[]): AnalyteResult[] => {
  const byKey = new Map<string, AnalyteResult>();

  for (const r of all) {
    const key = analyteKey(r);
    const seen = byKey.get(key);
    if (seen === undefined || r.date >= seen.date) byKey.set(key, r);
  }

  return [...byKey.values()];
}
