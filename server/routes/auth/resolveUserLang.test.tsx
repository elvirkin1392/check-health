import {resolveUserLang} from './resolveUserLang.tsx';

describe('выбор языка для Mini App', () => {
  test('AC-5: без сохранённого языка берётся язык клиента Telegram', () => {
    expect(resolveUserLang(undefined, 'ru')).toBe('ru');
    expect(resolveUserLang(null, 'ru')).toBe('ru');
    expect(resolveUserLang('', 'ru')).toBe('ru');
  });

  test('AC-6: неподдерживаемый язык клиента даёт английский', () => {
    expect(resolveUserLang(undefined, 'de')).toBe('en');
    expect(resolveUserLang(undefined, undefined)).toBe('en');
    expect(resolveUserLang(undefined, 'эльфийский')).toBe('en');
  });

  test('AC-7: сохранённый выбор важнее языка клиента', () => {
    expect(resolveUserLang('en', 'ru')).toBe('en');
    expect(resolveUserLang('ru', 'en')).toBe('ru');
  });

  test('AC-7: сохранённый выбор важнее, даже если совпадает с языком клиента', () => {
    expect(resolveUserLang('ru', 'ru')).toBe('ru');
  });

  test('AC-10: нераспознаваемое сохранённое значение не побеждает', () => {
    // В документе может лежать что угодно — например, остаток старых данных.
    expect(resolveUserLang('клингонский', 'ru')).toBe('ru');
    expect(resolveUserLang('клингонский', 'de')).toBe('en');
  });
});
