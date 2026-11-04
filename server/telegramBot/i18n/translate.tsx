import {createTranslate} from "../../../shared/i18n.tsx";
import {en} from "./dictionaries/en";
import {ru} from "./dictionaries/ru";

export type TranslationKey = keyof typeof en;

// Выставлены наружу, чтобы тесты могли сверить наборы ключей (§12).
export const dictionaries = {en, ru};

export const translate = createTranslate(dictionaries);
