import {en} from "./dictionaries/en";
import {ru} from "./dictionaries/ru";
import {Lang} from "../../../shared/lang.tsx";

export type TranslationKey = keyof typeof en;

const dictionaries: Record<Lang, typeof en> = {en, ru};

export const translate = (key: TranslationKey, lang: Lang, params?: Record<string, string | number>): string => {
  const template = dictionaries[lang][key];

  return params
    ? Object.entries(params).reduce((text, [name, value]) => text.split(`{{${name}}}`).join(String(value)), template)
    : template;
}
