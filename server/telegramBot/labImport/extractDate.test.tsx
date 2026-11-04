import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {extractDate, isAcceptableDate, MAX_AGE_YEARS} from './extractDate.tsx';
import {TextItem} from './extractText.tsx';

const fixture = (name: string): TextItem[] =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', `${name}.items.json`), 'utf8'));

const text = (...strings: string[]): TextItem[] =>
  strings.map((str, i) => ({str, x: 60, y: 800 - i * 20}));

describe('дата анализа из файла', () => {
  test('дата из шапки типовой выгрузки', () => {
    expect(extractDate(fixture('typical'))).toBe('2026-10-21');
  });

  test('AC-6: если даты в файле нет, возвращается undefined', () => {
    expect(extractDate(fixture('noDate'))).toBeUndefined();
  });

  test('дата отдаётся календарной строкой, без времени и смещения (§9)', () => {
    expect(extractDate(fixture('typical'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('день и месяц не путаются местами', () => {
    // 13 не может быть месяцем — проверка, что формат читается как день.месяц.год.
    expect(extractDate(text('Дата: 13.05.2026'))).toBe('2026-05-13');
  });

  test('дата через дефис и через слэш тоже читается', () => {
    expect(extractDate(text('21-10-2026'))).toBe('2026-10-21');
    expect(extractDate(text('21/10/2026'))).toBe('2026-10-21');
  });

  test('номер договора датой не считается', () => {
    expect(extractDate(text('Договор № 14-2026'))).toBeUndefined();
  });

  test('невозможная дата не принимается', () => {
    expect(extractDate(text('Дата: 32.13.2026'))).toBeUndefined();
  });

  test('из нескольких дат берётся первая — она в шапке', () => {
    expect(extractDate(text('Дата взятия: 21.10.2026', 'Дата печати: 23.10.2026')))
      .toBe('2026-10-21');
  });
});

describe('какая дата вообще может быть датой анализа', () => {
  const today = '2026-11-04';

  test('сегодня и прошлое — можно', () => {
    expect(isAcceptableDate(today, today)).toBe(true);
    expect(isAcceptableDate('2026-10-21', today)).toBe(true);
  });

  test('будущее — нельзя', () => {
    expect(isAcceptableDate('2026-11-05', today)).toBe(false);
    expect(isAcceptableDate('2027-01-01', today)).toBe(false);
  });

  test(`старше ${MAX_AGE_YEARS} лет — нельзя`, () => {
    expect(isAcceptableDate('2010-11-04', today)).toBe(false);
  });

  test('ровно на границе — можно', () => {
    expect(isAcceptableDate('2016-11-04', today)).toBe(true);
  });

  test('сравнение календарных дат не зависит от пояса (§9)', () => {
    // Обе даты — строки без смещения. Приводить их к поясу нельзя:
    // `2026-10-01` в UTC+5 превратилась бы в `2026-09-30`.
    expect(isAcceptableDate('2026-11-04', '2026-11-04')).toBe(true);
    expect(isAcceptableDate('2026-11-04', '2026-11-03')).toBe(false);
  });
});
