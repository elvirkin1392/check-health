// Shared between the bot and the Mini App: both need to agree on which
// languages exist and how to read the `lang` field of a user document.
// The dictionaries themselves are not shared — the bot's texts are its own.

export type Lang = 'en' | 'ru';

export const SUPPORTED_LANGUAGES: Lang[] = ['en', 'ru'];

// Человек выбирает ровно из этих двух языков. Всё остальное — не выбор:
// пустое поле нового документа, остаток старых данных, незнакомый
// `language_code` клиента Telegram.
export const isLang = (lang?: string | null): lang is Lang =>
  SUPPORTED_LANGUAGES.includes(lang as Lang);

export const resolveLang = (lang?: string): Lang => isLang(lang) ? lang : 'en';

// Какой язык показывать человеку: его сохранённый выбор, иначе язык клиента
// Telegram, иначе английский. Одно правило для бота и для Mini App — FR-5 спеки
// 003 требует именно этого, поэтому оно лежит здесь, а не в двух местах.
export const resolveUserLang = (
  storedLang?: string | null,
  telegramLanguageCode?: string | null,
): Lang => resolveLang(storedLang || telegramLanguageCode || undefined);
