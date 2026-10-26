// Какой язык показывать человеку.
//
// Правило то же, что уже применяет бот: сохранённый выбор важнее всего, затем язык
// клиента Telegram, затем английский. Считается на сервере, а не в браузере:
// `language_code` приходит из `initData`, проверенного подписью, тогда как
// клиентский `initDataUnsafe` не проверен ничем (§13).

import {Lang} from "../../../shared/lang.tsx";

export const resolveUserLang = (
  _storedLang?: string | null,
  _telegramLanguageCode?: string | null,
): Lang => {
  throw new Error('not implemented');
}
