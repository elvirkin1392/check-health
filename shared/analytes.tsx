// Справочник медицинских показателей: коды, подписи и синонимы для сопоставления.
//
// Общий для бота и Mini App: бот сопоставляет название из файла с кодом,
// приложение подписывает показатель на языке интерфейса. Почему свой, а не
// LOINC, — см. спецификацию 004, раздел «Почему не LOINC».

import {Lang} from './lang.tsx';

export type AnalyteEntry = {
  labels: Record<Lang, string>,
  // Как показатель называют в бланках. Сопоставление идёт по этому списку,
  // а не по подписи: лаборатория пишет «Билирубин общий», а не «Билирубин».
  synonyms: string[],
  // Код LOINC, если он известен. Нужен не нам, а тому, кто однажды
  // попросит данные в стандарте; пустое поле — не ошибка.
  loinc?: string,
};

export const ANALYTES: Record<string, AnalyteEntry> = {};

export type Analyte = {code?: string, name: string};

// Результат одного показателя, подтверждённый человеком (спецификация 004).
// `value` — строка, а не число: «отрицательно», «следы», «<0.5» в бланках
// обычны, и такую строку нельзя терять целиком.
export type AnalyteResult = {
  code?: string,
  name: string,
  value: string,
  unit?: string,
  normal?: {from?: number, to?: number, raw?: string},
  // Календарная дата без времени и смещения (§9).
  date: string,
};

export const matchAnalyte = (_name: string): Analyte => {
  throw new Error('not implemented');
}

export const analyteLabel = (_analyte: Analyte, _lang: Lang): string => {
  throw new Error('not implemented');
}
