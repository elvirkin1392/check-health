// Какой язык показывать человеку.
//
// Правило то же, что уже применяет бот: сохранённый выбор важнее всего, затем язык
// клиента Telegram, затем английский. Считается на сервере, а не в браузере:
// `language_code` приходит из `initData`, проверенного подписью, тогда как
// клиентский `initDataUnsafe` не проверен ничем (§13).

import {Lang, resolveLang} from "../../../shared/lang.tsx";

export const resolveUserLang = (
  storedLang?: string | null,
  telegramLanguageCode?: string | null,
): Lang => {
  // `resolveLang` falls back to English, so a value is recognised when it comes back
  // unchanged. An unrecognised stored value must not shadow a usable `language_code`.
  const recognised = [storedLang, telegramLanguageCode].find(
    (code): code is string => !!code && resolveLang(code) === code,
  );

  return resolveLang(recognised);
}
