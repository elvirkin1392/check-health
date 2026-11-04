// Весь поток загрузки файла: проверка, черновик, разбор, дата, подтверждение.
//
// Границы приходят зависимостями, а не импортируются: извлечение текста живёт
// в `pdfjs-dist`, который Jest здесь загрузить не может, поэтому экстрактор
// передаётся снаружи. Так же и скачивание файла, и база (§4).

import type {TextItem} from './extractText.tsx';
import {LabImportDbApi} from './labImport.db.tsx';
import {LabImportDoc} from '../../db/templates/LabImportTemplate.tsx';
import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';
import {extractDate, isAcceptableDate} from './extractDate.tsx';
import {mergeResults} from './mergeResults.tsx';
import {parseAnalytes} from './parseAnalytes.tsx';

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

export const LabImportService = (deps: LabImportDeps): LabImportServiceApi => {
  const {labImportDb, analytesDb} = deps;

  // В логи идут только номера и наш код причины (§14, FR-10). Ни названий,
  // ни значений, ни имени файла — в нём бывает фамилия. Текст исключения тоже
  // не пишем: ошибка библиотеки может цитировать фрагмент файла, поэтому
  // только `error.name`.
  const logFailure = (draft: Pick<LabImportDoc, 'userId' | 'draftId'>, code: string, error?: unknown) => {
    const errorName = error instanceof Error ? error.name : undefined;
    console.warn(
      `lab import failed: user=${draft.userId} draft=${draft.draftId} code=${code}`
      + (errorName ? ` error=${errorName}` : ''),
    );
  }

  const fail = async (draft: Pick<LabImportDoc, 'userId' | 'draftId'>, code: string, error?: unknown) => {
    logFailure(draft, code, error);
    await labImportDb.update(draft.draftId, {status: 'failed', failureCode: code});

    return {key: 'lab_parse_failed'};
  }

  // Что сказать человеку о разобранном черновике. Сам список строит
  // formatSummary по черновику; здесь только ключ и чего ждём дальше.
  const replyFor = (draft: LabImportDoc): LabImportReply => {
    if (draft.status === 'awaiting_date') {
      return {key: 'lab_date_missing', expects: 'date', draftId: draft.draftId};
    }

    return {
      key: 'lab_summary_header',
      params: {date: draft.date ?? ''},
      expects: 'confirm',
      draftId: draft.draftId,
    };
  }

  return {
    receive: async (userId, document) => {
      // Тип и размер проверяем до любого скачивания (§13): файл, который мы
      // не собираемся читать, не должен нагружать инстанс.
      if (document.mime_type !== ACCEPTED_MIME) {
        console.info(`lab import rejected: user=${userId} code=unsupported_file`);

        return {key: 'lab_unsupported_file'};
      }
      // Размер, который Telegram не сообщил, считаем неизвестным, а не нулевым:
      // иначе лимит обходится простым отсутствием поля.
      if (document.file_size === undefined || document.file_size > MAX_FILE_SIZE) {
        console.info(`lab import rejected: user=${userId} code=too_big`);

        return {key: 'lab_too_big'};
      }

      // Повторная доставка того же апдейта вернёт уже существующий черновик (§10),
      // поэтому draftId берём из ответа базы, а не из того, что сгенерировали.
      const draft = await labImportDb.create({
        draftId: deps.newDraftId(),
        userId,
        fileUniqueId: document.file_unique_id,
        fileId: document.file_id,
        status: 'received',
        createdAt: deps.now(),
      });

      return {key: 'lab_received', draftId: draft.draftId};
    },

    parse: async (draftId) => {
      const draft = await labImportDb.getByDraftId(draftId);
      if (!draft) {
        console.warn(`lab import failed: draft=${draftId} code=draft_not_found`);

        return {key: 'lab_parse_failed'};
      }
      // Переотправленный апдейт приводит сюда второй раз: заново файл не качаем
      // и черновик не перетираем, а отвечаем по текущему состоянию.
      if (draft.status === 'parsed' || draft.status === 'awaiting_date') {
        return replyFor(draft);
      }
      if (draft.status !== 'received') {
        return {key: 'lab_parse_failed'};
      }

      // Скачивание и извлечение ловим отдельно: код причины у них разный,
      // а человек в любом случае получает ответ, не молчание (§10).
      if (!draft.fileId) {
        return fail(draft, 'no_file_id');
      }
      let data: Uint8Array;
      try {
        data = await deps.downloadFile(draft.fileId);
      } catch (error) {
        return fail(draft, 'download_failed', error);
      }

      let items;
      try {
        items = await deps.extractTextItems(data);
      } catch (error) {
        return fail(draft, 'extract_failed', error);
      }

      const {rows, unparsed} = parseAnalytes(items);
      // Скан или файл не с анализами: сохранять нечего (FR-8).
      if (rows.length === 0) {
        return fail(draft, 'no_rows');
      }

      const date = extractDate(items);
      const status = date ? 'parsed' : 'awaiting_date';
      await labImportDb.update(draftId, {rows, unparsed, status, ...(date ? {date} : {})});
      console.info(`lab import parsed: user=${draft.userId} draft=${draftId} rows=${rows.length} status=${status}`);

      return replyFor({...draft, rows, unparsed, status, date});
    },

    setDate: async (userId, date) => {
      const draft = await labImportDb.getAwaitingDate(userId);
      if (!draft) {
        // Календарь остался с прошлого раза, а черновика уже нет.
        console.info(`lab import: user=${userId} code=no_draft_awaiting_date`);

        return {key: 'lab_parse_failed'};
      }

      // «Сегодня» — в поясе человека, а не сервера: восточнее UTC у него уже
      // может быть следующий день (§9).
      const today = await deps.userToday(userId);
      if (!isAcceptableDate(date, today)) {
        return {key: 'lab_date_invalid', draftId: draft.draftId};
      }

      await labImportDb.update(draft.draftId, {date, status: 'parsed'});

      return replyFor({...draft, date, status: 'parsed'});
    },

    confirm: async (draftId) => {
      const draft = await labImportDb.getByDraftId(draftId);
      if (!draft || draft.status === 'failed') {
        return {key: 'lab_parse_failed'};
      }
      // Повторное нажатие кнопки: уже записано, второй раз не пишем.
      if (draft.status === 'done') {
        return {key: 'lab_saved', params: {count: 0}, draftId};
      }
      // Без даты не сохраняем ничего: запись без даты не к чему привязать (§9).
      if (draft.status !== 'parsed' || !draft.date || !draft.rows) {
        return draft.status === 'awaiting_date'
          ? {key: 'lab_date_missing', expects: 'date', draftId}
          : {key: 'lab_parse_failed'};
      }

      const incoming: AnalyteResult[] = draft.rows.map(row => ({...row, date: draft.date!}));
      const {toSave, skipped} = mergeResults(await analytesDb.getSaved(draft.userId), incoming);
      if (toSave.length > 0) {
        await analytesDb.append(draft.userId, toSave);
      }
      await labImportDb.update(draftId, {status: 'done'});
      console.info(
        `lab import saved: user=${draft.userId} draft=${draftId} saved=${toSave.length} skipped=${skipped.length}`,
      );

      return {
        key: 'lab_saved',
        params: {count: toSave.length, ...(skipped.length > 0 ? {skipped: skipped.length} : {})},
        draftId,
      };
    },

    cancel: async (draftId) => {
      // Отмена не трогает документ пользователя: черновик просто закрывается.
      await labImportDb.update(draftId, {status: 'failed', failureCode: 'cancelled'});

      return {key: 'lab_cancelled'};
    },

    recoverStale: async () => {
      // Разбор, не доживший до конца, после рестарта не продолжить: ссылка
      // Telegram на файл живёт недолго, а своей копии у нас нет (§5).
      const stale = await labImportDb.findStale('received');
      const recovered: {draft: LabImportDoc, reply: LabImportReply}[] = [];

      for (const draft of stale) {
        await labImportDb.update(draft.draftId, {status: 'failed', failureCode: 'interrupted'});
        console.info(`lab import interrupted: user=${draft.userId} draft=${draft.draftId}`);
        recovered.push({
          draft: {...draft, status: 'failed', failureCode: 'interrupted'},
          reply: {key: 'lab_interrupted'},
        });
      }

      return recovered;
    },
  };
}
