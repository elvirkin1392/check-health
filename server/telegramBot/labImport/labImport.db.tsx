// Запросы к коллекции черновиков. Единственное место, которое знает про Mongo (§4).

import {Db} from 'mongodb';
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

export const LabImportDb = ({db: _db}: {db: Db}): LabImportDbApi => {
  throw new Error('not implemented');
}
