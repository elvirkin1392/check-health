// Shared between the bot and the Mini App: both need to agree on which
// languages exist and how to read the `lang` field of a user document.
// The dictionaries themselves are not shared — the bot's texts are its own.

export type Lang = 'en' | 'ru';

export const SUPPORTED_LANGUAGES: Lang[] = ['en', 'ru'];

export const resolveLang = (lang?: string): Lang =>
  SUPPORTED_LANGUAGES.includes(lang as Lang) ? (lang as Lang) : 'en';
