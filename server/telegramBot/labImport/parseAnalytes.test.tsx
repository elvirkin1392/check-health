import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {parseAnalytes} from './parseAnalytes.tsx';
import {TextItem} from './extractText.tsx';

// Фикстуры — то, что pdfjs на самом деле извлёк из сгенерированных PDF.
// Читается json, а не PDF: библиотека только ESM, внутрь Jest не загружается.
const fixture = (name: string): TextItem[] =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', `${name}.items.json`), 'utf8'));

// Строка таблицы в поддерживаемой вёрстке — чтобы случаи, которых нет
// в фикстурах, описывались в тесте, а не новым PDF.
const row = (y: number, cells: (string | undefined)[]): TextItem[] =>
  [60, 320, 400, 480]
    .map((x, i) => ({x, y, str: cells[i]!}))
    .filter(item => item.str !== undefined);

describe('AC-1: показатели из типовой выгрузки', () => {
  const parsed = () => parseAnalytes(fixture('typical'));

  test('найдены все четыре показателя', () => {
    expect(parsed().rows).toHaveLength(4);
  });

  test('у показателя есть название, значение и единица', () => {
    expect(parsed().rows[0]).toEqual(expect.objectContaining({
      name: 'Билирубин общий',
      value: '8.04',
      unit: 'мкмоль/л',
    }));
  });

  test('границы нормы разобраны в числа', () => {
    expect(parsed().rows[0].normal).toEqual(expect.objectContaining({from: 5, to: 21}));
  });

  test('шапка и строка с датой не попали в показатели', () => {
    const names = parsed().rows.map(r => r.name);

    expect(names).not.toContain('Клинический анализ крови');
    expect(names.some(name => name.includes('Дата'))).toBe(false);
  });

  test('порядок показателей — как в файле', () => {
    expect(parsed().rows.map(r => r.name)).toEqual([
      'Билирубин общий', 'Креатинин', 'Витамин D', 'Гомоцистеин плазмы',
    ]);
  });
});

describe('AC-8: разбирать нечего', () => {
  test('у скана нет текстового слоя — ни одного показателя', () => {
    expect(fixture('scan')).toHaveLength(0);
    expect(parseAnalytes(fixture('scan')).rows).toHaveLength(0);
  });

  test('в тексте без анализов показателей не находится', () => {
    expect(parseAnalytes(fixture('prose')).rows).toHaveLength(0);
  });

  test('связный текст не выдаётся за нераспознанные строки', () => {
    // Иначе человек получит абзацы договора под видом «не удалось прочитать».
    expect(parseAnalytes(fixture('prose')).unparsed).toHaveLength(0);
  });
});

describe('AC-9: нераспознанное видно отдельно', () => {
  test('табличная строка без значения уходит в unparsed, а не теряется', () => {
    const items = [
      ...row(740, ['Билирубин общий', '8.04', 'мкмоль/л', '5 - 21']),
      ...row(720, ['Креатинин', undefined, 'мкмоль/л', '0 - 50']),
    ];

    const {rows, unparsed} = parseAnalytes(items);

    expect(rows.map(r => r.name)).toEqual(['Билирубин общий']);
    expect(unparsed.join(' ')).toContain('Креатинин');
  });

  test('ни одна табличная строка не исчезает молча', () => {
    const items = [
      ...row(740, ['Билирубин общий', '8.04']),
      ...row(720, ['Креатинин', undefined, 'мкмоль/л']),
      ...row(700, ['Витамин D', '23']),
    ];

    const {rows, unparsed} = parseAnalytes(items);

    expect(rows.length + unparsed.length).toBe(3);
  });

  test('один и тот же показатель дважды с разными значениями — в unparsed', () => {
    // Молча выбрать одно из двух значений нельзя: это медицинские данные.
    const items = [
      ...row(740, ['Билирубин общий', '8.04', 'мкмоль/л']),
      ...row(720, ['Билирубин общий', '12.5', 'мкмоль/л']),
    ];

    const {rows, unparsed} = parseAnalytes(items);

    expect(rows).toHaveLength(0);
    expect(unparsed.join(' ')).toContain('8.04');
    expect(unparsed.join(' ')).toContain('12.5');
  });

  test('повтор с тем же значением дублем строки не считается', () => {
    const items = [
      ...row(740, ['Билирубин общий', '8.04', 'мкмоль/л']),
      ...row(720, ['Билирубин общий', '8.04', 'мкмоль/л']),
    ];

    const {rows, unparsed} = parseAnalytes(items);

    expect(rows).toHaveLength(1);
    expect(unparsed).toHaveLength(0);
  });
});

describe('нечисловые значения', () => {
  const parsed = () => parseAnalytes(fixture('nonNumeric'));

  test('«отрицательно» и «следы» сохраняются как значения', () => {
    expect(parsed().rows.map(r => r.value)).toEqual(
      expect.arrayContaining(['отрицательно', 'следы']),
    );
  });

  test('строка с нечисловым значением не выбрасывается целиком', () => {
    expect(parsed().rows).toHaveLength(3);
    expect(parsed().rows.map(r => r.name)).toContain('Антитела к ВПГ');
  });

  test('значение с неравенством сохраняется как записано', () => {
    const crp = parsed().rows.find(r => r.name === 'С-реактивный белок');

    expect(crp?.value).toBe('<0.5');
    expect(crp?.unit).toBe('мг/л');
  });
});

describe('узнанные показатели получают код', () => {
  test('AC-2: код из справочника проставлен при разборе', () => {
    const {rows} = parseAnalytes(fixture('typical'));

    expect(rows.find(r => r.name === 'Билирубин общий')?.code).toBe('bilirubin');
  });

  test('AC-3: у незнакомого показателя кода нет, но строка сохранена', () => {
    const {rows} = parseAnalytes(fixture('typical'));
    const unknown = rows.find(r => r.name === 'Гомоцистеин плазмы');

    expect(unknown).toBeDefined();
    expect(unknown?.code).toBeUndefined();
  });
});
