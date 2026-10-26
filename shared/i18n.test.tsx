import {createTranslate} from './i18n.tsx';

const dictionaries = {
  en: {greeting: 'Hello', healthy_days: 'Healthy for {{value}} day(s)'},
  ru: {greeting: 'Привет', healthy_days: 'Здоров {{value}} дн.'},
};

const translate = createTranslate(dictionaries);

describe('перевод по словарю', () => {
  test('возвращает строку выбранного языка', () => {
    expect(translate('greeting', 'ru')).toBe('Привет');
    expect(translate('greeting', 'en')).toBe('Hello');
  });

  test('подставляет параметры', () => {
    expect(translate('healthy_days', 'ru', {value: 7})).toBe('Здоров 7 дн.');
    expect(translate('healthy_days', 'en', {value: 7})).toBe('Healthy for 7 day(s)');
  });

  test('повторяющийся параметр подставляется везде', () => {
    const t = createTranslate({
      en: {twice: '{{v}} и ещё {{v}}'},
      ru: {twice: '{{v}} и ещё {{v}}'},
    });

    expect(t('twice', 'ru', {v: 'раз'})).toBe('раз и ещё раз');
  });

  test('AC-15: отсутствующий ключ возвращается как есть, а не роняет вызов', () => {
    // У бота это место бросало исключение при наличии параметров и отдавало
    // undefined без них — непереведённый ключ мог уронить обработку (§10).
    expect(translate('нет_такого' as any, 'ru')).toBe('нет_такого');
    expect(translate('нет_такого' as any, 'ru', {value: 1})).toBe('нет_такого');
  });

  test('AC-15: ключ, отсутствующий только в одном языке, не роняет другой', () => {
    const t = createTranslate({
      en: {only_en: 'English only'},
      ru: {} as Record<string, string>,
    });

    expect(t('only_en', 'en')).toBe('English only');
    expect(t('only_en', 'ru')).toBe('only_en');
  });
});
