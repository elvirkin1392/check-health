import {formatSummary, MESSAGE_LIMIT} from './formatSummary.tsx';
import {ParsedRow} from './parseAnalytes.tsx';

const row = (over: Partial<ParsedRow> = {}): ParsedRow => ({
  code: 'bilirubin',
  name: 'Билирубин общий',
  value: '8.04',
  unit: 'мкмоль/л',
  normal: {from: 5, to: 21},
  ...over,
});

describe('AC-9: распознанное и нераспознанное — отдельно', () => {
  test('нераспознанные строки перечислены и отличимы от распознанных', () => {
    const text = formatSummary(
      {rows: [row()], unparsed: ['Креатинин мкмоль/л'], date: '2026-10-21'},
      'ru',
    ).join('\n');

    const parsedAt = text.indexOf('Билирубин общий');
    const unparsedAt = text.indexOf('Креатинин');

    expect(parsedAt).toBeGreaterThanOrEqual(0);
    expect(unparsedAt).toBeGreaterThan(parsedAt);
  });

  test('без нераспознанных строк блока про них нет', () => {
    const text = formatSummary({rows: [row()], unparsed: [], date: '2026-10-21'}, 'ru')
      .join('\n');

    expect(text).toContain('Билирубин общий');
    expect(text.split('\n').filter(line => line.trim()).length).toBeLessThan(6);
  });

  test('значение и единица видны человеку', () => {
    const text = formatSummary({rows: [row()], unparsed: [], date: '2026-10-21'}, 'ru')
      .join('\n');

    expect(text).toContain('8.04');
    expect(text).toContain('мкмоль/л');
  });

  test('показатель без кода подписан так, как записан в файле', () => {
    const unknown = row({code: undefined, name: 'Гомоцистеин плазмы'});
    const text = formatSummary({rows: [unknown], unparsed: [], date: '2026-10-21'}, 'ru')
      .join('\n');

    expect(text).toContain('Гомоцистеин плазмы');
  });
});

describe('§11: лимит длины сообщения', () => {
  const many = Array.from({length: 300}, (_, i) =>
    row({code: undefined, name: `Показатель с довольно длинным названием № ${i}`}));

  test('ни одно сообщение не длиннее лимита', () => {
    for (const message of formatSummary({rows: many, unparsed: [], date: '2026-10-21'}, 'ru')) {
      expect(message.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
    }
  });

  test('длинный список не теряет конец', () => {
    const text = formatSummary({rows: many, unparsed: [], date: '2026-10-21'}, 'ru').join('\n');

    expect(text).toContain('№ 0');
    expect(text).toContain('№ 299');
  });

  test('короткий список — одно сообщение', () => {
    expect(formatSummary({rows: [row()], unparsed: [], date: '2026-10-21'}, 'ru'))
      .toHaveLength(1);
  });
});

describe('AC-11: язык ответа', () => {
  test('у человека с ru подписи русские', () => {
    const text = formatSummary({rows: [row()], unparsed: [], date: '2026-10-21'}, 'ru')
      .join('\n');

    expect(text).toContain('Билирубин');
  });

  test('у человека с en подпись узнанного показателя английская', () => {
    const text = formatSummary({rows: [row()], unparsed: [], date: '2026-10-21'}, 'en')
      .join('\n');

    expect(text).toContain('Bilirubin');
  });

  test('язык меняет текст сообщения', () => {
    const summary = {rows: [row()], unparsed: [], date: '2026-10-21'};

    expect(formatSummary(summary, 'ru').join('\n'))
      .not.toBe(formatSummary(summary, 'en').join('\n'));
  });
});
