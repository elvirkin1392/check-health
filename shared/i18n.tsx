// Перевод по словарю, общий для бота и Mini App.
//
// Подстановка `{{name}}` — договор между теми, кто пишет словари, и тем, кто их
// отрисовывает. Он один на обе половины: иначе тот же ключ с тем же параметром
// отрисуется по-разному в чате и в приложении.

import {Lang} from './lang.tsx';

export type Dictionary = Record<string, string>;

export const createTranslate = <D extends Dictionary>(_dictionaries: Record<Lang, D>) =>
  (_key: keyof D & string, _lang: Lang, _params?: Record<string, string | number>): string => {
    throw new Error('not implemented');
  };
