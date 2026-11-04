import {isLang, resolveLang, resolveUserLang, SUPPORTED_LANGUAGES} from './lang.tsx';

describe('набор языков', () => {
  test('человек выбирает ровно из двух', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'ru']);
  });

  test('isLang отделяет выбор от его отсутствия', () => {
    expect(isLang('ru')).toBe(true);
    expect(isLang('en')).toBe(true);
    // Пустое поле нового документа — не выбор, его нельзя записывать как язык.
    expect(isLang('')).toBe(false);
    expect(isLang(undefined)).toBe(false);
    expect(isLang(null)).toBe(false);
    expect(isLang('de')).toBe(false);
  });

  test('AC-10: нераспознаваемое значение приводится к языку по умолчанию', () => {
    expect(resolveLang('эльфийский')).toBe('en');
    expect(resolveLang('')).toBe('en');
    expect(resolveLang(undefined)).toBe('en');
  });
});

describe('выбор языка для человека', () => {
  test('AC-5: без сохранённого языка берётся язык клиента Telegram', () => {
    expect(resolveUserLang(undefined, 'ru')).toBe('ru');
    expect(resolveUserLang(null, 'ru')).toBe('ru');
    // Поле нового документа пустое — это тоже «нет сохранённого выбора».
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
    expect(resolveUserLang('ru', 'ru')).toBe('ru');
  });

  test('AC-10: нераспознаваемое сохранённое значение даёт язык по умолчанию', () => {
    // В документе может лежать что угодно — например, остаток старых данных.
    // Правило то же, что было в боте: такое значение не обходится, а сводится
    // к английскому. Иначе бот и Mini App ответили бы одному человеку
    // на разных языках.
    expect(resolveUserLang('клингонский', 'ru')).toBe('en');
    expect(resolveUserLang('клингонский', 'de')).toBe('en');
  });
});

describe('FR-5: правило одно и то же для бота и Mini App', () => {
  const cases: [string | null | undefined, string | null | undefined][] = [
    [undefined, 'ru'], ['', 'ru'], ['ru', 'en'], ['en', 'ru'],
    ['клингонский', 'ru'], [undefined, undefined], ['', ''],
  ];

  test('оба вызывают одну функцию, а не повторяют её выражением', () => {
    // Сторож: пока правило живёт здесь одной функцией, расходиться нечему.
    // Если копия правила снова появится в вызывающем коде, этот набор
    // перестанет что-либо гарантировать — поэтому он сверяется с тем же
    // выражением, которое раньше стояло в боте.
    for (const [stored, code] of cases) {
      expect(resolveUserLang(stored, code)).toBe(resolveLang(stored || code || undefined));
    }
  });
});
