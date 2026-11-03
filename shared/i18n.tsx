// Перевод по словарю, общий для бота и Mini App.
//
// Подстановка `{{name}}` — договор между теми, кто пишет словари, и тем, кто их
// отрисовывает. Он один на обе половины: иначе тот же ключ с тем же параметром
// отрисуется по-разному в чате и в приложении.

import {Lang} from './lang.tsx';

export type Dictionary = Record<string, string>;

export const createTranslate = <D extends Dictionary>(dictionaries: Record<Lang, D>) =>
  (key: keyof D & string, lang: Lang, params?: Record<string, string | number>): string => {
    const template: string | undefined = dictionaries[lang]?.[key];

    // A missing key must not break the caller (§10): show the key itself.
    if (template === undefined) return key;

    return params
      ? Object.entries(params).reduce(
        (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
        template,
      )
      : template;
  };
