import {translate, dictionaries, SUPPORTED_LANGUAGES, resolveLang} from './index.tsx';
import {SUPPORTED_LANGUAGES as SHARED_LANGUAGES} from '../../../shared/lang.tsx';

describe('словари Mini App', () => {
  test('AC-3: наборы ключей en и ru совпадают', () => {
    expect(Object.keys(dictionaries.ru).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  test('AC-3: ни один перевод не пустой', () => {
    for (const [lang, dictionary] of Object.entries(dictionaries)) {
      for (const [key, value] of Object.entries(dictionary)) {
        expect(`${lang}.${key}: ${value}`).not.toMatch(/: *$/);
      }
    }
  });

  test('AC-4: список языков тот же, что в общем коде', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(SHARED_LANGUAGES);
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'ru']);
  });

  test('AC-10: нераспознаваемый язык приводится к английскому', () => {
    expect(resolveLang('эльфийский')).toBe('en');
    expect(resolveLang(undefined)).toBe('en');
    expect(resolveLang('')).toBe('en');
  });
});

describe('подписи экрана входа', () => {
  test('AC-1: пользователь с ru видит русские подписи', () => {
    expect(translate('login', 'ru')).toBe('Войти');
    expect(translate('verify', 'ru')).toBe('Подтвердить');
    expect(translate('username', 'ru')).toBe('имя пользователя');
  });

  test('AC-2: пользователь с en видит английские подписи', () => {
    expect(translate('login', 'en')).toBe('Login');
    expect(translate('verify', 'en')).toBe('Verify');
    expect(translate('username', 'en')).toBe('username');
  });

  test('AC-1: подстановка работает и в русском тексте', () => {
    expect(translate('code_sent', 'ru', {username: 'elvira'})).toBe('Код отправлен @elvira');
  });
});
