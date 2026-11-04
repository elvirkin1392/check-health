// Дедупликация при сохранении: одни и те же показатели за одну дату
// не удваиваются (FR-7).

import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';

export type MergeResult = {
  // Что действительно нужно дописать в документ пользователя.
  toSave: AnalyteResult[],
  // Что отброшено как уже сохранённое — человеку стоит об этом сказать.
  skipped: AnalyteResult[],
};

// Код стабилен, название в разных бланках пишется по-разному, поэтому код
// главнее. Показатель без кода сравниваем по названию: регистр и лишние
// пробелы в одном и том же бланке меняться не должны, но от PDF к PDF могут.
const analyteKey = ({code, name}: AnalyteResult): string =>
  code ?? name.trim().toLowerCase().replace(/\s+/g, ' ');

// Значение в ключ не входит: исправленный результат за ту же дату не должен
// проезжать второй записью. Единица входит: мкмоль/л и мг/дл сравнить нечем,
// это разные измерения.
// Разделитель — перевод строки: в названии и единице из PDF его не бывает.
const recordKey = (result: AnalyteResult): string =>
  [analyteKey(result), result.date, result.unit ?? ''].join('\n');

export const mergeResults = (
  saved: AnalyteResult[],
  incoming: AnalyteResult[],
): MergeResult => {
  // Сохранённое не трогаем — только читаем ключи. Новые ключи добавляются
  // сюда же по ходу, чтобы дубль внутри одной загрузки тоже отсёкся.
  const seen = new Set(saved.map(recordKey));
  const toSave: AnalyteResult[] = [];
  const skipped: AnalyteResult[] = [];

  for (const result of incoming) {
    const key = recordKey(result);
    if (seen.has(key)) {
      skipped.push(result);
    } else {
      seen.add(key);
      toSave.push(result);
    }
  }

  return {toSave, skipped};
}
