import {translate, resolveLang, dictionaries} from './index.tsx';
import {SUPPORTED_LANGUAGES} from '../../../shared/lang.tsx';

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

describe('AC-11: тексты загрузки файла есть на обоих языках', () => {
  // Ключи, на которые ссылается поток загрузки файла (004, FR-11).
  const KEYS = [
    'lab_received',
    'lab_unsupported_file',
    'lab_too_big',
    'lab_parse_failed',
    'lab_interrupted',
    'lab_date_missing',
    'lab_date_invalid',
    'lab_saved',
    'lab_cancelled',
    'lab_duplicates_skipped',
    'lab_summary_header',
    'lab_unparsed_header',
    'lab_confirm_button',
    'lab_cancel_button',
  ];

  test('ни один ключ не потерян', () => {
    for (const key of KEYS) {
      expect(Object.keys(dictionaries.en)).toContain(key);
    }
  });

  test('наборы ключей en и ru совпадают', () => {
    expect(Object.keys(dictionaries.ru).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  test('ни один перевод не пустой', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const key of KEYS) {
        // Проверяется само значение, а не строка с ним: подстановка
        // превращала отсутствующий ключ в слово «undefined», и тест проходил
        // на пустом словаре.
        const value = dictionaries[lang][key];

        expect(typeof value).toBe('string');
        expect(String(value).trim()).not.toBe('');
      }
    }
  });

  test('русский текст отличается от английского', () => {
    // Скопированный английский в ru — незакрытая задача, а не перевод (§12).
    for (const key of KEYS) {
      expect(`${key}: ${dictionaries.ru[key]}`).not.toBe(`${key}: ${dictionaries.en[key]}`);
    }
  });
});
