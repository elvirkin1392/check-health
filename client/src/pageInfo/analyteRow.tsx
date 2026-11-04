// Что показать в строке таблицы анализов.
//
// Две вещи, которые видны только на настоящих данных: нечисловой результат
// нельзя сравнивать с нормой, а предыдущее значение в других единицах —
// с текущим (спецификация 004, FR-6).

import {AnalyteResult} from '../../../shared/analytes.tsx';

// Ключ показателя: код, если он известен, иначе название из файла.
export const analyteKey = (_result: AnalyteResult): string => {
  throw new Error('not implemented');
}

// `undefined` — «сравнить нельзя»: значение не число или нормы нет.
// Это не то же самое, что «вне нормы», и красить такую строку нельзя.
export const isWithinNormal = (_result: AnalyteResult): boolean | undefined => {
  throw new Error('not implemented');
}

// Последняя более ранняя запись того же показателя в тех же единицах.
// Мкмоль/л рядом с мг/дл сравнивать нечем, поэтому при расхождении — `undefined`.
export const previousResult = (
  _all: AnalyteResult[],
  _current: AnalyteResult,
): AnalyteResult | undefined => {
  throw new Error('not implemented');
}

// Самое свежее значение каждого показателя — то, что попадает в таблицу.
export const latestResults = (_all: AnalyteResult[]): AnalyteResult[] => {
  throw new Error('not implemented');
}
