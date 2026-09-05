import {translate, resolveLang} from './translate';

describe('translate', () => {
  test('returns the string for the given language', () => {
    expect(translate('cold_start_question', 'en')).toBe('How long does the flu last?');
    expect(translate('cold_start_question', 'ru')).toBe('Сколько длится простуда?');
  });

  test('interpolates params', () => {
    expect(translate('healthy_days', 'en', {value: 5})).toBe("You've been healthy for 5 day(s)");
    expect(translate('healthy_days', 'ru', {value: 5})).toBe('Вы здоровы уже 5 дн.');
  });
})

describe('resolveLang', () => {
  test('passes through a supported language', () => {
    expect(resolveLang('ru')).toBe('ru');
  });

  test('falls back to English for anything unsupported or missing', () => {
    expect(resolveLang('fr')).toBe('en');
    expect(resolveLang(undefined)).toBe('en');
  });
})
