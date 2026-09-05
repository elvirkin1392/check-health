import {en} from "./dictionaries/en";
import {ru} from "./dictionaries/ru";

export type Lang = 'en' | 'ru';
export type TranslationKey = keyof typeof en;

const dictionaries: Record<Lang, typeof en> = {en, ru};

export const SUPPORTED_LANGUAGES: Lang[] = ['en', 'ru'];

export const resolveLang = (lang?: string): Lang =>
  SUPPORTED_LANGUAGES.includes(lang as Lang) ? (lang as Lang) : 'en';

export const translate = (key: TranslationKey, lang: Lang, params?: Record<string, string | number>): string => {
  const template = dictionaries[lang][key];

  return params
    ? Object.entries(params).reduce((text, [name, value]) => text.split(`{{${name}}}`).join(String(value)), template)
    : template;
}
