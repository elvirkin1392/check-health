// Текущий язык интерфейса.
//
// Живёт в localStorage рядом с токеном: сервер присылает его при входе
// (`telegramLogin`) и при смене в настройках, а читается он синхронно, до первой
// отрисовки (FR-5, FR-8). Подписка нужна, чтобы смена языка перерисовала интерфейс.

import {useSyncExternalStore} from 'react';
import {Lang, isLang, resolveLang, translate, TranslationKey} from './index';

const STORAGE_KEY = 'lang';

const listeners = new Set<() => void>();

// Нет сохранённого значения или оно нераспознаваемо — английский (FR-5).
export const getStoredLang = (): Lang => resolveLang(localStorage.getItem(STORAGE_KEY) ?? undefined);

// Записывается только настоящий выбор из двух языков. Иначе пустое поле `lang`
// нового документа, приходящее в `GET /api/profile`, затирало бы язык,
// вычисленный при входе из `language_code`, и интерфейс переключался бы
// на английский у человека с русским Telegram (AC-5).
export const storeLang = (lang: string | undefined): void => {
  if (!isLang(lang)) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach(listener => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const useLang = () => {
  const lang = useSyncExternalStore(subscribe, getStoredLang);
  const t = (key: TranslationKey, params?: Record<string, string | number>) => translate(key, lang, params);

  return {lang, t};
}
