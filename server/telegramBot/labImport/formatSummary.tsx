// Сообщение с результатом разбора: что распознано, что нет.
// Чистая функция — ни Telegram, ни базы (§4).

import {analyteLabel} from '../../../shared/analytes.tsx';
import {Lang, translate} from '../i18n/index.tsx';
import {ParsedRow} from './parseAnalytes.tsx';

// Телеграм обрывает сообщение длиннее этого; список показателей бывает длинным,
// и конец терять нельзя (§11).
export const MESSAGE_LIMIT = 4096;

export type Summary = {rows: ParsedRow[], unparsed: string[], date?: string};

// Строка из файла может быть сколь угодно длинной, а одна строка списка
// не должна сама по себе перебирать лимит.
const clip = (line: string): string =>
  line.length <= MESSAGE_LIMIT ? line : `${line.slice(0, MESSAGE_LIMIT - 1)}…`;

const rowLine = (row: ParsedRow, lang: Lang): string => {
  const label = analyteLabel(row, lang);
  // Узнанный показатель подписан по справочнику, и подпись может быть грубее
  // записи в бланке: «Билирубин» на месте «Билирубин общий». Человек сверяет
  // список со своим бланком, поэтому название из файла остаётся рядом.
  const written = row.name.trim();
  const title = written && written.toLowerCase() !== label.toLowerCase()
    ? `${label} (${written})`
    : label;
  return clip(`• ${title}: ${[row.value, row.unit].filter(Boolean).join(' ')}`);
}

// Одно сообщение или несколько, если список не влез.
export const formatSummary = (summary: Summary, lang: Lang): string[] => {
  const lines = summary.rows.map(row => rowLine(row, lang));
  const unparsed = summary.unparsed.map(line => clip(`• ${line}`));

  // Заголовок приклеен к первой строке своего блока: при разрезе по лимиту
  // он не должен остаться последней строкой сообщения без списка под ним.
  // Даты может не быть, пока человек её не выбрал, — тогда заголовка нет,
  // а не «анализ от :».
  const blocks: string[] = [];
  const glue = (header: string | undefined, list: string[]) => {
    if (header === undefined) {
      blocks.push(...list);
    } else if (list.length === 0) {
      blocks.push(header);
    } else {
      blocks.push(`${header}\n${list[0]}`, ...list.slice(1));
    }
  };

  glue(
    summary.date === undefined ? undefined : translate('lab_summary_header', lang, {date: summary.date}),
    lines,
  );
  // Пустая строка перед блоком нераспознанного отделяет его от списка выше.
  if (unparsed.length > 0) {
    glue(`\n${translate('lab_unparsed_header', lang)}`, unparsed);
  }

  const messages: string[] = [];
  let current = '';
  for (const block of blocks) {
    const next = current === '' ? block : `${current}\n${block}`;
    if (next.length <= MESSAGE_LIMIT) {
      current = next;
    } else {
      messages.push(current);
      current = block.trimStart();
    }
  }
  if (current !== '') messages.push(current);

  return messages;
}
