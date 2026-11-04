// Генератор фикстур. Запуск: `npm run fixtures --workspace @check-health/server`.
//
// Настоящих бланков в репозитории быть не должно (§14), поэтому PDF собираются
// здесь из описания ячеек. Рядом с каждым PDF кладётся `.items.json` — то, что
// из него на самом деле извлёк pdfjs. Тесты читают json: загрузить pdfjs внутрь
// Jest нельзя, он только ESM. Файлы обязаны быть согласованы — за этим следит
// `npm run fixtures:check`, который перегенерирует их и сверит с тем, что в git.
//
// Кириллица — через `/Encoding /Differences` с именами глифов `/uniXXXX`:
// у встроенных шрифтов PDF русских букв нет, а имена глифов pdfjs читает.

import {writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {extractTextItems} from '../extractText.tsx';

// Скрипт запускается только через tsx, то есть как ESM: `__dirname` здесь нет.
// В `extractText.tsx` так нельзя — тот модуль собирается ещё и в CommonJS.
const here = dirname(fileURLToPath(import.meta.url));

type Cell = {x: number, y: number, text: string};

const buildPdf = (cells: Cell[], extra = ''): Buffer => {
  const chars = [...new Set(cells.map(c => c.text).join(''))].filter(ch => ch !== ' ');
  const codes = new Map<string, number>();
  // С 33, чтобы не задевать служебные байты и пробел.
  chars.forEach((ch, i) => codes.set(ch, 33 + i));

  const escape = (text: string) => [...text]
    .map(ch => ch === ' ' ? 32 : codes.get(ch)!)
    .map(byte => byte === 0x28 || byte === 0x29 || byte === 0x5c
      ? '\\' + String.fromCharCode(byte)
      : String.fromCharCode(byte))
    .join('');

  const stream = [
    ...cells.map(({x, y, text}) => `BT /F1 10 Tf 1 0 0 1 ${x} ${y} Tm (${escape(text)}) Tj ET`),
    extra,
  ].filter(Boolean).join('\n');

  const differences = chars.length
    ? '[ ' + chars.map(ch =>
        `${codes.get(ch)} /uni${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`
      ).join(' ') + ' ]'
    : '[ ]';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] '
      + '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding 6 0 R >>',
    `<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences ${differences} >>`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(offset => { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

// Строка таблицы в той вёрстке, которую фича считает поддерживаемой:
// название — значение — единица — границы нормы, каждое в своей колонке.
const row = (y: number, name: string, value: string, unit?: string, normal?: string): Cell[] => [
  {x: 60, y, text: name},
  {x: 320, y, text: value},
  ...(unit ? [{x: 400, y, text: unit}] : []),
  ...(normal ? [{x: 480, y, text: normal}] : []),
];

const FIXTURES: Record<string, Cell[] | {cells: Cell[], extra: string}> = {
  // Типовая выгрузка: дата в шапке, четыре показателя, один из них не из справочника.
  typical: [
    {x: 60, y: 800, text: 'Клинический анализ крови'},
    {x: 60, y: 780, text: 'Дата взятия: 21.10.2026'},
    ...row(740, 'Билирубин общий', '8.04', 'мкмоль/л', '5 - 21'),
    ...row(720, 'Креатинин', '21.1', 'мкмоль/л', '0 - 50'),
    ...row(700, 'Витамин D', '23', 'нг/мл', '30 - 100'),
    ...row(680, 'Гомоцистеин плазмы', '9.2', 'мкмоль/л', '5 - 15'),
  ],

  // Нечисловые результаты — в бланках обычное дело.
  nonNumeric: [
    {x: 60, y: 780, text: 'Дата: 03.11.2026'},
    ...row(740, 'Антитела к ВПГ', 'отрицательно'),
    ...row(720, 'Белок в моче', 'следы'),
    ...row(700, 'С-реактивный белок', '<0.5', 'мг/л', '0 - 5'),
  ],

  // Даты в файле нет — её придётся спросить у человека (AC-6).
  noDate: [
    {x: 60, y: 800, text: 'Результаты исследования'},
    ...row(740, 'Билирубин общий', '12.5', 'мкмоль/л', '5 - 21'),
  ],

  // Анализов нет вовсе: текст есть, разбирать нечего (AC-8).
  prose: [
    {x: 60, y: 780, text: 'Договор оказания услуг № 14-2026'},
    {x: 60, y: 760, text: 'Исполнитель обязуется оказать услуги в срок,'},
    {x: 60, y: 740, text: 'а заказчик — принять и оплатить их.'},
  ],

  // Скан: текстового слоя нет, только залитый прямоугольник (AC-8).
  scan: {cells: [], extra: '0.5 g 60 600 480 200 re f'},
};

const run = async () => {
  for (const [name, value] of Object.entries(FIXTURES)) {
    const {cells, extra} = Array.isArray(value) ? {cells: value, extra: ''} : value;
    const pdf = buildPdf(cells, extra);
    writeFileSync(join(here, `${name}.pdf`), pdf);

    const items = await extractTextItems(new Uint8Array(pdf));
    writeFileSync(join(here, `${name}.items.json`), JSON.stringify(items, null, 2) + '\n');

    console.log(`${name}: ${pdf.length} байт, ${items.length} фрагментов текста`);
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
