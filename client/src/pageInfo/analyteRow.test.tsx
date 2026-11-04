import {analyteKey, isWithinNormal, latestResults, previousResult} from './analyteRow.tsx';
import {AnalyteResult} from '../../../shared/analytes.tsx';

const result = (over: Partial<AnalyteResult> = {}): AnalyteResult => ({
  code: 'bilirubin',
  name: 'Билирубин общий',
  value: '8.04',
  unit: 'мкмоль/л',
  normal: {from: 5, to: 21},
  date: '2026-10-21',
  ...over,
});

describe('сравнение с нормой', () => {
  test('значение внутри границ — в норме', () => {
    expect(isWithinNormal(result({value: '8.04'}))).toBe(true);
  });

  test('значение выше и ниже границ — вне нормы', () => {
    expect(isWithinNormal(result({value: '42'}))).toBe(false);
    expect(isWithinNormal(result({value: '1'}))).toBe(false);
  });

  test('значение ровно на границе — в норме', () => {
    expect(isWithinNormal(result({value: '5'}))).toBe(true);
    expect(isWithinNormal(result({value: '21'}))).toBe(true);
  });

  test('нечисловое значение не сравнивается ни с чем', () => {
    // `Number('следы')` — это NaN, и сравнение молча давало «вне нормы».
    // Такую строку красить нельзя: мы не знаем, плохо это или хорошо.
    expect(isWithinNormal(result({value: 'следы', normal: undefined}))).toBeUndefined();
    expect(isWithinNormal(result({value: 'отрицательно'}))).toBeUndefined();
    expect(isWithinNormal(result({value: '<0.5'}))).toBeUndefined();
  });

  test('без границ нормы сравнивать нечем', () => {
    expect(isWithinNormal(result({normal: undefined}))).toBeUndefined();
  });

  test('односторонняя норма работает', () => {
    expect(isWithinNormal(result({value: '8', normal: {to: 21}}))).toBe(true);
    expect(isWithinNormal(result({value: '42', normal: {to: 21}}))).toBe(false);
    expect(isWithinNormal(result({value: '8', normal: {from: 5}}))).toBe(true);
  });

  test('значение с запятой вместо точки тоже число', () => {
    expect(isWithinNormal(result({value: '8,04'}))).toBe(true);
  });
});

describe('предыдущее значение', () => {
  test('берётся последняя более ранняя запись', () => {
    const all = [
      result({date: '2026-08-01', value: '7.0'}),
      result({date: '2026-09-01', value: '9.04'}),
      result({date: '2026-10-21', value: '8.04'}),
    ];

    expect(previousResult(all, all[2])?.value).toBe('9.04');
  });

  test('единицы различаются — сравнивать нечем', () => {
    // Мкмоль/л рядом с мг/дл не динамика, а две разные величины.
    const all = [
      result({date: '2026-09-01', value: '0.5', unit: 'мг/дл'}),
      result({date: '2026-10-21', value: '8.04', unit: 'мкмоль/л'}),
    ];

    expect(previousResult(all, all[1])).toBeUndefined();
  });

  test('запись в других единицах не заслоняет подходящую', () => {
    const all = [
      result({date: '2026-08-01', value: '7.0', unit: 'мкмоль/л'}),
      result({date: '2026-09-01', value: '0.5', unit: 'мг/дл'}),
      result({date: '2026-10-21', value: '8.04', unit: 'мкмоль/л'}),
    ];

    expect(previousResult(all, all[2])?.value).toBe('7.0');
  });

  test('первая в истории запись предыдущего не имеет', () => {
    const all = [result()];

    expect(previousResult(all, all[0])).toBeUndefined();
  });

  test('другой показатель предыдущим не считается', () => {
    const all = [
      result({date: '2026-09-01', code: 'creatinine', name: 'Креатинин', value: '21.1'}),
      result({date: '2026-10-21'}),
    ];

    expect(previousResult(all, all[1])).toBeUndefined();
  });

  test('показатель без кода сравнивается по названию', () => {
    const all = [
      result({date: '2026-09-01', code: undefined, name: 'Ферритин', value: '30'}),
      result({date: '2026-10-21', code: undefined, name: 'Ферритин', value: '45'}),
    ];

    expect(previousResult(all, all[1])?.value).toBe('30');
  });

  test('запись той же даты предыдущей не считается', () => {
    const all = [result({value: '9.04'}), result({value: '8.04'})];

    expect(previousResult(all, all[1])).toBeUndefined();
  });
});

describe('что попадает в таблицу', () => {
  test('по каждому показателю — самая свежая запись', () => {
    const all = [
      result({date: '2026-09-01', value: '9.04'}),
      result({date: '2026-10-21', value: '8.04'}),
      result({date: '2026-10-21', code: 'creatinine', name: 'Креатинин', value: '21.1'}),
    ];

    const latest = latestResults(all);

    expect(latest).toHaveLength(2);
    expect(latest.find(r => r.code === 'bilirubin')?.value).toBe('8.04');
  });

  test('порядок записей в базе не влияет на выбор свежей', () => {
    const all = [
      result({date: '2026-10-21', value: '8.04'}),
      result({date: '2026-09-01', value: '9.04'}),
    ];

    expect(latestResults(all)[0].value).toBe('8.04');
  });

  test('пустая история — пустая таблица', () => {
    expect(latestResults([])).toHaveLength(0);
  });
});

describe('ключ показателя', () => {
  test('у узнанного показателя ключ — код', () => {
    expect(analyteKey(result())).toBe('bilirubin');
  });

  test('у незнакомого — название, приведённое к одному виду', () => {
    expect(analyteKey(result({code: undefined, name: '  Ферритин  '})))
      .toBe(analyteKey(result({code: undefined, name: 'ферритин'})));
  });
});
