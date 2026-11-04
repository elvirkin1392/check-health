import {mergeResults} from './mergeResults.tsx';
import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';

const result = (over: Partial<AnalyteResult> = {}): AnalyteResult => ({
  code: 'bilirubin',
  name: 'Билирубин общий',
  value: '8.04',
  unit: 'мкмоль/л',
  date: '2026-10-21',
  ...over,
});

describe('AC-7: повторная загрузка не создаёт дублей', () => {
  test('тот же показатель за ту же дату не сохраняется второй раз', () => {
    const {toSave, skipped} = mergeResults([result()], [result()]);

    expect(toSave).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  test('тот же показатель за другую дату — новая запись', () => {
    const {toSave} = mergeResults([result()], [result({date: '2026-11-03'})]);

    expect(toSave).toHaveLength(1);
  });

  test('другой показатель за ту же дату — новая запись', () => {
    const incoming = result({code: 'creatinine', name: 'Креатинин', value: '21.1'});
    const {toSave} = mergeResults([result()], [incoming]);

    expect(toSave).toHaveLength(1);
  });

  test('дубль определяется по дате и показателю, а не по значению', () => {
    // Иначе исправленное значение проехало бы второй записью за ту же дату.
    const {toSave, skipped} = mergeResults([result()], [result({value: '12.5'})]);

    expect(toSave).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  test('показатель без кода сравнивается по названию', () => {
    const saved = result({code: undefined, name: 'Гомоцистеин плазмы'});
    const {toSave} = mergeResults([saved], [{...saved}]);

    expect(toSave).toHaveLength(0);
  });

  test('название без кода сравнивается без учёта регистра и пробелов', () => {
    const saved = result({code: undefined, name: 'Гомоцистеин плазмы'});
    const incoming = result({code: undefined, name: '  ГОМОЦИСТЕИН  ПЛАЗМЫ '});
    const {toSave} = mergeResults([saved], [incoming]);

    expect(toSave).toHaveLength(0);
  });

  test('показатель без кода не путается с другим показателем без кода', () => {
    const saved = result({code: undefined, name: 'Гомоцистеин плазмы'});
    const incoming = result({code: undefined, name: 'Ферритин'});
    const {toSave} = mergeResults([saved], [incoming]);

    expect(toSave).toHaveLength(1);
  });

  test('та же дата, но другая единица — отдельная запись', () => {
    // Сравнивать мг/дл с мкмоль/л нечем, значит это разные измерения.
    const {toSave} = mergeResults([result()], [result({unit: 'мг/дл'})]);

    expect(toSave).toHaveLength(1);
  });

  test('пустая база — сохраняется всё', () => {
    const incoming = [result(), result({code: 'creatinine', name: 'Креатинин'})];
    const {toSave, skipped} = mergeResults([], incoming);

    expect(toSave).toHaveLength(2);
    expect(skipped).toHaveLength(0);
  });

  test('дубль внутри одной загрузки тоже не удваивается', () => {
    const {toSave} = mergeResults([], [result(), result()]);

    expect(toSave).toHaveLength(1);
  });

  test('уже сохранённые записи не переписываются', () => {
    const saved = [result()];
    mergeResults(saved, [result({value: '12.5'})]);

    expect(saved).toEqual([result()]);
  });
});
