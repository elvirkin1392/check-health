// Запросы к коллекции черновиков. Единственное место, которое знает про Mongo (§4).

import {Db, WithId} from 'mongodb';
import {LabImportDoc, LabImportStatus} from '../../db/templates/LabImportTemplate.tsx';

export type LabImportDbApi = {
  // Заводит черновик, если такого файла у человека ещё нет в работе.
  // Повторная доставка того же апдейта второй черновик не создаёт (§10):
  // возвращается уже существующий.
  create: (draft: LabImportDoc) => Promise<LabImportDoc>,
  getByDraftId: (draftId: string) => Promise<LabImportDoc | null>,
  getAwaitingDate: (userId: number) => Promise<LabImportDoc | null>,
  update: (draftId: string, patch: Partial<LabImportDoc>) => Promise<void>,
  // Черновики, которые остались в работе после рестарта процесса (§5).
  findStale: (status: LabImportStatus) => Promise<LabImportDoc[]>,
  ensureIndexes: () => Promise<void>,
};

// Срок жизни черновика. С запасом: человек может подтвердить разбор не сразу (§14).
const DRAFT_TTL_SECONDS = 7 * 24 * 60 * 60;

// «В работе» — всё, кроме завершённых. Только такие черновики занимают пару
// {userId, fileUniqueId}: иначе исправленную версию того же файла прислать нельзя.
const ACTIVE_STATUSES: LabImportStatus[] = ['received', 'parsed', 'awaiting_date'];

// TTL-индекс Mongo понимает только BSON Date, а в LabImportDoc `createdAt` —
// ISO-строка (§9). Со строкой индекс создаётся, но ничего не удаляет, и
// медицинские данные лежали бы вечно (§14). Поэтому на границе с базой
// строка превращается в Date и обратно; момент времени при этом сохраняется.
type StoredLabImport = Omit<LabImportDoc, 'createdAt'> & {createdAt: Date};

const DUPLICATE_KEY = 11000;

const toStored = (draft: LabImportDoc): StoredLabImport => ({...draft, createdAt: new Date(draft.createdAt)});

const fromStored = (stored: WithId<StoredLabImport>): LabImportDoc => {
  // `_id` наружу не отдаём: черновик опознаётся по `draftId`.
  const {_id, createdAt, ...rest} = stored;

  return {...rest, createdAt: createdAt.toISOString()};
};

export const LabImportDb = ({db}: {db: Db}): LabImportDbApi => {
  const imports = db.collection<StoredLabImport>('lab_imports');

  const findInWork = async (userId: number, fileUniqueId: string) => {
    const found = await imports.findOne({userId, fileUniqueId, status: {$in: ACTIVE_STATUSES}});

    return found ? fromStored(found) : null;
  };

  return {
    ensureIndexes: async () => {
      // $in в partialFilterExpression требует MongoDB 6.0+; $ne/$nin там недопустимы.
      await imports.createIndex(
        {userId: 1, fileUniqueId: 1},
        {unique: true, partialFilterExpression: {status: {$in: ACTIVE_STATUSES}}},
      );
      await imports.createIndex({createdAt: 1}, {expireAfterSeconds: DRAFT_TTL_SECONDS});
    },
    create: async (draft) => {
      try {
        // Upsert, а не insertOne: переотправленный апдейт находит уже заведённый
        // черновик и не создаёт второй (§10).
        const result = await imports.findOneAndUpdate(
          {userId: draft.userId, fileUniqueId: draft.fileUniqueId, status: {$in: ACTIVE_STATUSES}},
          {$setOnInsert: toStored(draft)},
          {upsert: true, returnDocument: 'after'},
        );

        if (result) {
          return fromStored(result);
        }
      } catch (e) {
        // Две доставки одного апдейта разошлись по времени: вторая упёрлась в
        // уникальный индекс. Это не ошибка — черновик уже есть, отдаём его.
        if ((e as {code?: number}).code !== DUPLICATE_KEY) {
          throw e;
        }
      }

      return (await findInWork(draft.userId, draft.fileUniqueId)) ?? draft;
    },
    getByDraftId: async (draftId) => {
      const found = await imports.findOne({draftId});

      return found ? fromStored(found) : null;
    },
    getAwaitingDate: async (userId) => {
      const found = await imports.findOne({userId, status: 'awaiting_date'});

      return found ? fromStored(found) : null;
    },
    update: async (draftId, patch) => {
      const {createdAt, ...rest} = patch;
      const stored = createdAt === undefined ? rest : {...rest, createdAt: new Date(createdAt)};

      await imports.updateOne({draftId}, {$set: stored});
    },
    findStale: async (status) => {
      const found = await imports.find({status}).toArray();

      return found.map(fromStored);
    },
  };
}
