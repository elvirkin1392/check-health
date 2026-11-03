import {createTranslate} from '../../../shared/i18n.tsx';
import {en} from './dictionaries/en';
import {ru} from './dictionaries/ru';

export type TranslationKey = keyof typeof en;

export const dictionaries = {en, ru};

export const translate = createTranslate(dictionaries);

export {isLang, resolveLang, SUPPORTED_LANGUAGES} from '../../../shared/lang.tsx';
export type {Lang} from '../../../shared/lang.tsx';
