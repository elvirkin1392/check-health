// Разбор извлечённых фрагментов в показатели. Чистая функция: ни PDF,
// ни Telegram, ни базы (§4).

import {matchAnalyte} from '../../../shared/analytes.tsx';
import {TextItem} from './extractText.tsx';

export type ParsedRow = {
  code?: string,
  name: string,
  // Строка, а не число: «отрицательно», «следы», «<0.5» — тоже результаты.
  value: string,
  unit?: string,
  normal?: {from?: number, to?: number, raw?: string},
};

// Нераспознанное не теряется молча, а показывается человеку отдельно (FR-9).
export type ParseResult = {rows: ParsedRow[], unparsed: string[]};

// Фрагменты одной строки таблицы приходят с `y`, отличающимся на доли пункта
// (разный кегль в ячейках), поэтому равенство `y` слишком строго.
const ROW_TOLERANCE = 2;

const NUMBER = '\\d+(?:[.,]\\d+)?';
const toNumber = (text: string): number => Number(text.replace(',', '.'));

// «5 - 21»; дефис, короткое и длинное тире — как их печатают в бланках.
const RANGE = new RegExp(`^(${NUMBER})\\s*[-–—]\\s*(${NUMBER})$`);
// «< 5» и «> 30» — граница только с одной стороны.
const UPPER_ONLY = new RegExp(`^(?:<|≤|<=)\\s*(${NUMBER})$`);
const LOWER_ONLY = new RegExp(`^(?:>|≥|>=)\\s*(${NUMBER})$`);

// Число, возможно с неравенством: «8.04», «<0.5».
const NUMERIC_VALUE = new RegExp(`^(?:[<>≤≥=~]|<=|>=)?\\s*${NUMBER}$`);

// Дата в строке — это шапка бланка («Дата взятия: …»), а не показатель.
const DATE_IN_TEXT = /(?<!\d)\d{1,2}[./-]\d{1,2}[./-]\d{4}(?!\d)/;

type Normal = NonNullable<ParsedRow['normal']>;

const parseNormal = (raw: string): Normal => {
  const text = raw.trim();
  const range = RANGE.exec(text);
  if (range) return {from: toNumber(range[1]), to: toNumber(range[2]), raw: text};
  const upper = UPPER_ONLY.exec(text);
  if (upper) return {to: toNumber(upper[1]), raw: text};
  const lower = LOWER_ONLY.exec(text);
  if (lower) return {from: toNumber(lower[1]), raw: text};
  // Нормы словами («отсутствуют») не теряются: показываются как записано.
  return {raw: text};
}

// Единица измерения в этой колонке или всё-таки значение? Нужно, когда ячейки
// значения в строке нет: тогда на её месте оказывается единица, и принять её
// за результат — значит молча сохранить «мкмоль/л» как значение показателя.
// Отличают единицу `/` или `%`; числа и «<0.5» — всегда значения («10^9/л»
// числом не является, поэтому проверка числа идёт первой).
const looksLikeUnit = (cell: string): boolean =>
  !NUMERIC_VALUE.test(cell) && /[/%]/.test(cell);

// Значение показателя — вторая колонка, если она не единица и не норма.
const isValueCell = (cell: string): boolean =>
  !looksLikeUnit(cell) && !RANGE.test(cell);

type Entry = {
  // Исходный текст строки: именно его увидит человек, если строка не разобрана.
  text: string,
  row?: ParsedRow,
  // Ключ показателя для поиска повторов в файле.
  key?: string,
};

// Собирает строки: подряд идущие фрагменты с одним `y`. Глобальная группировка
// по `y` склеила бы строки разных страниц (на каждой `y` начинается заново).
const toLines = (items: TextItem[]): TextItem[][] => {
  const lines: TextItem[][] = [];
  let currentY: number | undefined;

  for (const item of items) {
    if (currentY !== undefined && Math.abs(item.y - currentY) <= ROW_TOLERANCE) {
      lines[lines.length - 1].push(item);
    } else {
      lines.push([item]);
      currentY = item.y;
    }
  }

  return lines.map(line => [...line].sort((a, b) => a.x - b.x));
}

const toEntry = (cells: string[]): Entry | undefined => {
  // Одна ячейка в группе — шапка или связный текст. Показывать её среди
  // «не удалось прочитать» нельзя: человек получит абзацы договора.
  if (cells.length < 2) return undefined;
  if (cells.some(cell => DATE_IN_TEXT.test(cell))) return undefined;

  const text = cells.join(' ');
  const [name, value, ...rest] = cells;

  // Табличная строка без читаемого значения не исчезает молча (FR-9).
  if (!isValueCell(value)) return {text};

  const analyte = matchAnalyte(name);
  const row: ParsedRow = {...analyte, value};

  // Дальше идут единица и норма, любая может отсутствовать. Одна ячейка —
  // норма, если разбирается как граница («5 - 21»), иначе единица.
  if (rest.length === 1) {
    if (RANGE.test(rest[0]) || UPPER_ONLY.test(rest[0]) || LOWER_ONLY.test(rest[0])) {
      row.normal = parseNormal(rest[0]);
    } else {
      row.unit = rest[0];
    }
  } else if (rest.length > 1) {
    row.unit = rest[0];
    row.normal = parseNormal(rest.slice(1).join(' '));
  }

  // Тот же ключ, что у дедупликации при сохранении (FR-7): код, иначе название
  // без регистра и лишних пробелов.
  const key = analyte.code ?? name.trim().replace(/\s+/g, ' ').toLowerCase();
  return {text, row, key};
}

export const parseAnalytes = (items: TextItem[]): ParseResult => {
  const entries = toLines(items)
    .map(line => toEntry(line.map(item => item.str.trim()).filter(Boolean)))
    .filter((entry): entry is Entry => entry !== undefined);

  // Один показатель дважды: одинаковое значение — это один результат, разное —
  // конфликт. Выбрать из двух медицинских значений молча нельзя, поэтому
  // в таблицу не попадает ни одно (FR-9). Единица входит в сравнение: 8.04 мкмоль/л
  // и 8.04 мг/дл — разные результаты.
  const seen = new Map<string, Entry>();
  const conflicted = new Set<string>();
  for (const entry of entries) {
    if (!entry.row || entry.key === undefined) continue;
    const first = seen.get(entry.key);
    if (!first) {
      seen.set(entry.key, entry);
    } else if (first.row!.value !== entry.row.value || first.row!.unit !== entry.row.unit) {
      conflicted.add(entry.key);
    }
  }

  const rows: ParsedRow[] = [];
  const unparsed: string[] = [];
  const taken = new Set<string>();

  for (const entry of entries) {
    if (!entry.row || entry.key === undefined || conflicted.has(entry.key)) {
      unparsed.push(entry.text);
    } else if (!taken.has(entry.key)) {
      taken.add(entry.key);
      rows.push(entry.row);
    }
  }

  return {rows, unparsed};
}
