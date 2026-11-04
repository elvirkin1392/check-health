// Черновик разбора загруженного файла.
//
// Отдельная коллекция, а не поле в документе пользователя: черновик
// недолговечен, у него есть состояние, которое обязано пережить рестарт
// Cloud Run (§5), и раздувать документ пользователя транзиентными записями
// незачем (§8). Содержимое чистится по TTL — это медицинские данные (§14).

import {AnalyteResult} from './UserTemplate.tsx';
import {ParsedRow} from '../../telegramBot/labImport/parseAnalytes.tsx';

export type LabImportStatus =
  | 'received'        // файл принят, разбор ещё не закончен
  | 'parsed'          // разобран, ждёт подтверждения
  | 'awaiting_date'   // разобран, но даты в файле не было
  | 'done'            // подтверждён и сохранён
  | 'failed';         // разобрать не удалось

export type LabImportDoc = {
  // Восемь hex-символов: короткий, чтобы влезть в `callback_data` (§11).
  draftId: string,
  userId: number,
  // От Telegram, стабилен для одного и того же файла: по нему переотправленный
  // апдейт не создаёт второй черновик (§10).
  fileUniqueId: string,
  // От Telegram, по нему файл скачивается при разборе. Хранится в черновике, а не
  // в памяти процесса: состояние разбора живёт в базе (§5). Не медицинские данные.
  fileId?: string,
  status: LabImportStatus,
  // ISO со смещением — это момент, а не календарная дата (§9).
  createdAt: string,
  rows?: ParsedRow[],
  unparsed?: string[],
  date?: string,
  // Код причины, а не текст ошибки: он может содержать фрагмент файла (§14).
  failureCode?: string,
};

export type SavedAnalytes = AnalyteResult[];
