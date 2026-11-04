import {Db} from 'mongodb';

import {LabImportDb} from './labImport.db.tsx';

// Мок на границе Mongo: проверяется, о чём база просят, а не сама база (§4).
const fakeDb = () => {
  const indexes: unknown[] = [];
  const calls: {name: string, args: unknown[]}[] = [];

  const collection = {
    createIndex: async (keys: unknown, options?: unknown) => {
      indexes.push({keys, options});
      return 'ok';
    },
    findOneAndUpdate: async (...args: unknown[]) => {
      calls.push({name: 'findOneAndUpdate', args});
      return null;
    },
    findOne: async (...args: unknown[]) => {
      calls.push({name: 'findOne', args});
      return null;
    },
    updateOne: async (...args: unknown[]) => {
      calls.push({name: 'updateOne', args});
      return {};
    },
    find: (...args: unknown[]) => {
      calls.push({name: 'find', args});
      return {toArray: async () => []};
    },
    insertOne: async (...args: unknown[]) => {
      calls.push({name: 'insertOne', args});
      return {};
    },
  };

  const db = {collection: () => collection} as unknown as Db;

  return {db, indexes, calls};
};

const json = (value: unknown) => JSON.stringify(value);

describe('§10: один файл — один черновик', () => {
  test('уникальный индекс по человеку и файлу', async () => {
    const {db, indexes} = fakeDb();

    await LabImportDb({db}).ensureIndexes();

    const unique = indexes.find(index => json(index).includes('fileUniqueId'));
    expect(json(unique)).toContain('userId');
    expect(json(unique)).toContain('"unique":true');
  });

  test('индекс не мешает загрузить тот же файл после завершённого разбора', async () => {
    // Иначе человек не смог бы прислать исправленную версию того же анализа:
    // индекс должен покрывать только черновики в работе.
    const {db, indexes} = fakeDb();

    await LabImportDb({db}).ensureIndexes();

    const unique = indexes.find(index => json(index).includes('fileUniqueId'));
    expect(json(unique)).toContain('partialFilterExpression');
  });

  test('создание черновика не вставляет второй для того же файла', async () => {
    const {db, calls} = fakeDb();

    await LabImportDb({db}).create({
      draftId: 'a1b2c3d4',
      userId: 42,
      fileUniqueId: 'AQADabc',
      status: 'received',
      createdAt: '2026-11-04T10:00:00+03:00',
    });

    // Безусловный insertOne создал бы дубль при переотправке апдейта.
    expect(calls.map(c => c.name)).not.toContain('insertOne');
  });
});

describe('§14: черновики не лежат вечно', () => {
  test('TTL-индекс по времени создания', async () => {
    const {db, indexes} = fakeDb();

    await LabImportDb({db}).ensureIndexes();

    const ttl = indexes.find(index => json(index).includes('expireAfterSeconds'));
    expect(json(ttl)).toContain('createdAt');
  });
});

describe('поиск черновиков', () => {
  test('черновик, ждущий даты, ищется по человеку и статусу', async () => {
    const {db, calls} = fakeDb();

    await LabImportDb({db}).getAwaitingDate(42);

    const query = json(calls.find(c => c.name === 'findOne')?.args);
    expect(query).toContain('awaiting_date');
    expect(query).toContain('42');
  });

  test('зависшие черновики ищутся по статусу', async () => {
    const {db, calls} = fakeDb();

    await LabImportDb({db}).findStale('received');

    expect(json(calls.find(c => c.name === 'find')?.args)).toContain('received');
  });
});
