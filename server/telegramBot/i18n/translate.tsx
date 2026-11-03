import {createTranslate} from "../../../shared/i18n.tsx";
import {en} from "./dictionaries/en";
import {ru} from "./dictionaries/ru";

export type TranslationKey = keyof typeof en;

export const translate = createTranslate({en, ru});
