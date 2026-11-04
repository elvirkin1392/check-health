import {randomBytes} from "node:crypto";
import {DateTime as dt} from "luxon";
import {sendMessage, downloadFile} from "./telegram.api.tsx";
import {
  updateDbData,
  getDbLastIllDay,
  getDbIllPeriods,
  getDbLastIllPeriod,
  getDbUserLang,
  getDbUserTimeZone,
  createDbUser,
  getLabImportDb,
  analytesDb
} from "./telegram.db.tsx";
import {
  calcPeriodBetweenDates,
  extractPeriodsFromYear,
  getResponseToInlineButton,
  getMessageTemplate,
  restructureUpdatesData
} from "./helpers/main";
import {Document, Update, User} from "./telegram.types.tsx";
import {toggleJob, rescheduleUserJobs} from "../cron/main.tsx";
import {Command} from "./enums/Command";
import {userToday, userTodayMonth} from "./helpers/userDay.tsx";
import {buildLabKeyboard} from "./helpers/getMessageTemplate.tsx";
import {MessageType} from "./enums/MessageType";
import {translate, Lang, TranslationKey} from "./i18n/index.tsx";
import {LabImportService, LabImportReply} from "./labImport/labImport.service.tsx";
import {LabImportDbApi} from "./labImport/labImport.db.tsx";
import {extractTextItems} from "./labImport/extractText.tsx";
import {formatSummary} from "./labImport/formatSummary.tsx";

const manageTgUpdates = async (update: Update) => {
  const info = restructureUpdatesData(update);
  if (!info) {
    return;
  }
  const {messageType, userTg, message, document} = info;

  switch (messageType) {
    case 'bot_command': {
      await sendResponseToCommand(userTg, message);
      return;
    }
    case 'inline_button': {
      const {command, value} = JSON.parse(message);
      const lang = await getDbUserLang(userTg);
      const timeZone = await getDbUserTimeZone(userTg.id);
      const nextMove = getResponseToInlineButton(command, value, lang, timeZone);

      if (nextMove.updateData) {
        await updateDbData({
          command,
          user: userTg,
          data: nextMove.updateData
        });
      }
      // After the update, so the jobs are rebuilt from the zone just stored.
      if (nextMove.rescheduleJobs) {
        await rescheduleUserJobs(userTg.id, nextMove.updateData?.timeZone);
      }
      if (nextMove.jobConfig) {
        await toggleJob({userId: userTg.id, ...nextMove.jobConfig})
      }
      if (nextMove.closeSession) {
        await sendMessage(userTg.id, nextMove.closeSession);
      }
      if (nextMove.labImport) {
        await handleLabImportButton(userTg, lang, timeZone, nextMove.labImport);
      }
      return;
    }
    case 'document': {
      await handleLabDocument(userTg, document);
      return;
    }
    // Обычные текстовые сообщения не обрабатываются: правка значений в фичу
    // загрузки анализов не входит (004).
  }
}

// Сервис разбора с настоящими границами. Собирается при вызове, а не при загрузке
// модуля: так импорт этого файла не требует ни базы, ни Telegram.
const buildLabImport = (labImportDb: LabImportDbApi = getLabImportDb()) => LabImportService({
  labImportDb,
  analytesDb,
  downloadFile,
  extractTextItems,
  // Настоящий пояс человека, а не серверное «сейчас» (§9).
  userToday: async (userId) => userToday(await getDbUserTimeZone(userId)),
  newDraftId: () => randomBytes(4).toString('hex'),
  now: () => dt.now().toISO()!
});

const calendarForLabDate = (text: string, lang: Lang, timeZone?: string) => ({
  text,
  reply_markup: getMessageTemplate(MessageType.Calendar, {
    target: Command.LabDate, ...userTodayMonth(timeZone), lang, timeZone
  }).reply_markup
});

// Ответ сервиса — ключ и параметры, а не текст: переводим на языке человека (§12).
const sendLabReply = async (
  labImportDb: LabImportDbApi, userId: number, lang: Lang, timeZone: string | undefined, reply: LabImportReply
) => {
  if (reply.expects === 'confirm' && reply.draftId) {
    const draft = await labImportDb.getByDraftId(reply.draftId);
    if (draft) {
      const messages = formatSummary({rows: draft.rows ?? [], unparsed: draft.unparsed ?? [], date: draft.date}, lang);
      // Клавиатура под последней частью: подтверждать надо уже прочитав всё.
      for (const [index, text] of messages.entries()) {
        await sendMessage(userId, index === messages.length - 1
          ? {text, reply_markup: buildLabKeyboard(draft.draftId, lang)}
          : {text});
      }
      return;
    }
    await sendMessage(userId, {text: translate('lab_parse_failed', lang)});
    return;
  }

  let text = translate(reply.key as TranslationKey, lang, reply.params);
  const skipped = reply.params?.skipped;
  if (typeof skipped === 'number') {
    text += `\n${translate('lab_duplicates_skipped', lang, {count: skipped})}`;
  }
  // Дата не выбрана или не подошла: к тексту прикладывается календарь.
  if (reply.expects === 'date' || reply.key === 'lab_date_invalid') {
    await sendMessage(userId, calendarForLabDate(text, lang, timeZone));
    return;
  }
  await sendMessage(userId, {text});
}

// Сбой после ответа Telegram человек не увидит сам: без этого он остался бы
// без ответа (§10). Логируем только номера и error.name (§14).
const reportLabFailure = async (userId: number, lang: Lang, draftId: string | undefined, error: unknown) => {
  console.error(
    `lab import failed: user=${userId}${draftId ? ` draft=${draftId}` : ''} code=unexpected`
    + ` error=${error instanceof Error ? error.name : 'unknown'}`
  );
  await sendMessage(userId, {text: translate('lab_parse_failed', lang)});
}

const handleLabDocument = async (userTg: User, document: Document) => {
  const lang = await getDbUserLang(userTg);
  const timeZone = await getDbUserTimeZone(userTg.id);
  const labImportDb = getLabImportDb();
  const labImport = buildLabImport(labImportDb);

  // Быстрая часть: ответ «принял» уходит до разбора. Сам вебхук Telegram уже
  // ответил, но человеку тоже нужно знать, что файл дошёл.
  const received = await labImport.receive(userTg.id, document);
  await sendLabReply(labImportDb, userTg.id, lang, timeZone, received);
  if (received.key !== 'lab_received' || !received.draftId) {
    return;
  }

  try {
    const parsed = await labImport.parse(received.draftId);
    await sendLabReply(labImportDb, userTg.id, lang, timeZone, parsed);
  } catch (error) {
    await reportLabFailure(userTg.id, lang, received.draftId, error);
  }
}

const handleLabImportButton = async (
  userTg: User, lang: Lang, timeZone: string | undefined, {action, value}: {action: 'confirm' | 'cancel' | 'date', value: string}
) => {
  const labImportDb = getLabImportDb();
  const labImport = buildLabImport(labImportDb);
  const draftId = action === 'date' ? undefined : value;

  try {
    // Кнопку может нажать только хозяин черновика (§13): номер в кнопке — не секрет.
    if (draftId && (await labImportDb.getByDraftId(draftId))?.userId !== userTg.id) {
      await sendMessage(userTg.id, {text: translate('lab_parse_failed', lang)});
      return;
    }
    const reply = action === 'confirm' ? await labImport.confirm(value)
      : action === 'cancel' ? await labImport.cancel(value)
      : await labImport.setDate(userTg.id, value);
    await sendLabReply(labImportDb, userTg.id, lang, timeZone, reply);
  } catch (error) {
    await reportLabFailure(userTg.id, lang, draftId, error);
  }
}

// При старте, рядом с restoreJobs (§5). Без индексов не действуют ни уникальность
// черновика, ни TTL (§10, §14). Ошибка одного шага или одного человека не должна
// ломать остальные.
const restoreLabImports = async () => {
  const labImportDb = getLabImportDb();

  try {
    await labImportDb.ensureIndexes();
  } catch (error) {
    console.error(`lab import indexes failed: code=ensure_indexes error=${error instanceof Error ? error.name : 'unknown'}`);
  }

  let recovered;
  try {
    recovered = await buildLabImport(labImportDb).recoverStale();
  } catch (error) {
    console.error(`lab import recovery failed: code=recover_stale error=${error instanceof Error ? error.name : 'unknown'}`);
    return;
  }

  for (const {draft, reply} of recovered) {
    try {
      const lang = await getDbUserLang({id: draft.userId});
      await sendMessage(draft.userId, {text: translate(reply.key as TranslationKey, lang, reply.params)});
    } catch (error) {
      console.error(
        `lab import notice failed: user=${draft.userId} draft=${draft.draftId} code=notify`
        + ` error=${error instanceof Error ? error.name : 'unknown'}`
      );
    }
  }
}

const sendResponseToCommand = async (userTg: User, command: string, value?: any) => {
  const lang = await getDbUserLang(userTg);
  const timeZone = await getDbUserTimeZone(userTg.id);
  // Все даты этой команды считаются от сегодняшнего дня пользователя, а не сервера (§9).
  const today = userToday(timeZone);
  let params:any = {value, lang, timeZone};
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case Command.Start: {
      const status = await createDbUser(userTg);
      params = {status, lang};
      break;
    }
    case Command.HealthyDays: {
      const lastIllDay = await getDbLastIllDay(userTg, today);
      params.value = lastIllDay ? calcPeriodBetweenDates(lastIllDay, today).days : undefined;
      break;
    }
    case Command.HealthyYear: {
      const periods = await getDbIllPeriods(userTg);
      params.value = extractPeriodsFromYear(periods, today);
      break;
    }
    case Command.TimeZone: {
      params.value = await getDbUserTimeZone(userTg.id);
      break;
    }
    case Command.ColdEnd: {
      await getDbLastIllPeriod(userTg);
      // value = get(lastPeriod); todo return last start date to calc available dates
      break;
    }
  }

  const options = getMessageTemplate(command, params);
  if (options) {
    await sendMessage(userTg.id, options);
  }
}

export {
  manageTgUpdates,
  restoreLabImports,
  sendResponseToCommand
}
