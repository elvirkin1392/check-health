// Дедупликация при сохранении: одни и те же показатели за одну дату
// не удваиваются (FR-7).

import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';

export type MergeResult = {
  // Что действительно нужно дописать в документ пользователя.
  toSave: AnalyteResult[],
  // Что отброшено как уже сохранённое — человеку стоит об этом сказать.
  skipped: AnalyteResult[],
};

export const mergeResults = (
  _saved: AnalyteResult[],
  _incoming: AnalyteResult[],
): MergeResult => {
  throw new Error('not implemented');
}
