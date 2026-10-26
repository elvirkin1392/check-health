// Подписи медицинских показателей.
//
// Показатель опознаётся кодом, а не строкой в данных: только по коду его можно
// подписать на двух языках. Неизвестный код — не ошибка: в файле из лаборатории
// встретится что угодно, и такая строка выводится как записана (спецификация 003,
// FR-10; разбор файлов — спецификация 004).

import {Lang} from '../../../shared/lang.tsx';

export type Analyte = {code?: string, name: string};

export const analyteLabel = (_analyte: Analyte, _lang: Lang): string => {
  throw new Error('not implemented');
}
