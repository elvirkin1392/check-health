// Дата анализа в таблице. Раньше месяц форматировался жёстко как `en-US`,
// независимо от языка интерфейса (спецификация 003, FR-6).

import {Lang} from '../../../shared/lang.tsx';

export const formatAnalyteDate = (_date: Date, _lang: Lang): string => {
  throw new Error('not implemented');
}
