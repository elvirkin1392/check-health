// Весь поток загрузки файла: проверка, черновик, разбор, дата, подтверждение.
//
// Границы приходят зависимостями, а не импортируются: извлечение текста живёт
// в `pdfjs-dist`, который Jest здесь загрузить не может, поэтому экстрактор
// передаётся снаружи. Так же и скачивание файла, и база (§4).

import type {TextItem} from './extractText.tsx';
import {LabImportDbApi} from './labImport.db.tsx';
import {LabImportDoc} from '../../db/templates/LabImportTemplate.tsx';
import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';

// Что бот должен сказать человеку: ключ перевода, а не готовый текст (§12).
export type LabImportReply = {
  key: string,
  params?: Record<string, string | number>,
  // Чего ждут от человека дальше.
  expects?: 'confirm' | 'date',
  draftId?: string,
};

// Файл, как его описывает Telegram.
export type IncomingDocument = {
  file_id: string,
  file_unique_id: string,
  mime_type?: string,
  file_size?: number,
  file_name?: string,
};

export type LabImportDeps = {
  labImportDb: LabImportDbApi,
  // Границa документа пользователя.
  analytesDb: {
    getSaved: (userId: number) => Promise<AnalyteResult[]>,
    append: (userId: number, results: AnalyteResult[]) => Promise<void>,
  },
  downloadFile: (fileId: string) => Promise<Uint8Array>,
  extractTextItems: (data: Uint8Array) => Promise<TextItem[]>,
  // Сегодня в поясе пользователя, а не на сервере (§9).
  userToday: (userId: number) => Promise<string>,
  newDraftId: () => string,
  now: () => string,
};

export type LabImportServiceApi = {
  // Быстрая часть: проверить файл и завести черновик. Ответ Telegram уходит
  // сразу после неё, до разбора (§10).
  receive: (userId: number, document: IncomingDocument) => Promise<LabImportReply>,
  // Медленная часть: скачать, разобрать, дописать черновик.
  parse: (draftId: string) => Promise<LabImportReply>,
  setDate: (userId: number, date: string) => Promise<LabImportReply>,
  confirm: (draftId: string) => Promise<LabImportReply>,
  cancel: (draftId: string) => Promise<LabImportReply>,
  // Черновики, зависшие в разборе после рестарта (§5).
  recoverStale: () => Promise<{draft: LabImportDoc, reply: LabImportReply}[]>,
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_MIME = 'application/pdf';

export const LabImportService = (_deps: LabImportDeps): LabImportServiceApi => {
  throw new Error('not implemented');
}
