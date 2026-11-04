import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {
  ACCEPTED_MIME, IncomingDocument, LabImportDeps, LabImportService, MAX_FILE_SIZE,
} from './labImport.service.tsx';
import {LabImportDbApi} from './labImport.db.tsx';
import {LabImportDoc} from '../../db/templates/LabImportTemplate.tsx';
import {AnalyteResult} from '../../db/templates/UserTemplate.tsx';
import {TextItem} from './extractText.tsx';

const fixture = (name: string): TextItem[] =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', `${name}.items.json`), 'utf8'));

const USER = 42;

const pdf = (over: Partial<IncomingDocument> = {}): IncomingDocument => ({
  file_id: 'AgACAgIAAx',
  file_unique_id: 'AQADabc',
  mime_type: ACCEPTED_MIME,
  file_size: 120 * 1024,
  file_name: 'Иванова_анализы.pdf',
  ...over,
});

// Моки только на границах: база, скачивание файла, извлечение текста (§4).
const harness = (over: Partial<LabImportDeps> = {}) => {
  const drafts: LabImportDoc[] = [];
  const saved = new Map<number, AnalyteResult[]>();
  const downloaded: string[] = [];
  let items: TextItem[] = fixture('typical');

  const labImportDb: LabImportDbApi = {
    create: async (draft) => {
      const existing = drafts.find(d =>
        d.userId === draft.userId
        && d.fileUniqueId === draft.fileUniqueId
        && d.status !== 'done' && d.status !== 'failed');
      if (existing) {
        return existing;
      }
      drafts.push(draft);
      return draft;
    },
    getByDraftId: async (draftId) => drafts.find(d => d.draftId === draftId) ?? null,
    getAwaitingDate: async (userId) =>
      drafts.find(d => d.userId === userId && d.status === 'awaiting_date') ?? null,
    update: async (draftId, patch) => {
      const draft = drafts.find(d => d.draftId === draftId);
      Object.assign(draft!, patch);
    },
    findStale: async (status) => drafts.filter(d => d.status === status),
    ensureIndexes: async () => {},
  };

  let counter = 0;
  const deps: LabImportDeps = {
    labImportDb,
    analytesDb: {
      getSaved: async (userId) => saved.get(userId) ?? [],
      append: async (userId, results) => {
        saved.set(userId, [...(saved.get(userId) ?? []), ...results]);
      },
    },
    downloadFile: async (fileId) => { downloaded.push(fileId); return new Uint8Array([1, 2, 3]); },
    extractTextItems: async () => items,
    userToday: async () => '2026-11-04',
    newDraftId: () => `draft${++counter}`,
    now: () => '2026-11-04T10:00:00+03:00',
    ...over,
  };

  return {
    service: LabImportService(deps),
    drafts, downloaded,
    savedFor: (userId: number) => saved.get(userId) ?? [],
    setItems: (next: TextItem[]) => { items = next; },
  };
};

describe('файл отклоняется до скачивания', () => {
  test('не PDF — отказ, и файл не качали', async () => {
    const h = harness();

    const reply = await h.service.receive(USER, pdf({mime_type: 'image/jpeg'}));

    expect(reply.key).toBe('lab_unsupported_file');
    expect(h.downloaded).toHaveLength(0);
    expect(h.drafts).toHaveLength(0);
  });

  test('слишком большой файл — отказ, и файл не качали', async () => {
    const h = harness();

    const reply = await h.service.receive(USER, pdf({file_size: MAX_FILE_SIZE + 1}));

    expect(reply.key).toBe('lab_too_big');
    expect(h.downloaded).toHaveLength(0);
  });

  test('файл в пределах лимита принимается', async () => {
    const h = harness();

    const reply = await h.service.receive(USER, pdf({file_size: MAX_FILE_SIZE}));

    expect(reply.key).toBe('lab_received');
  });
});

describe('§10: переотправка апдейта не создаёт второй черновик', () => {
  test('тот же файл дважды — один черновик', async () => {
    const h = harness();

    await h.service.receive(USER, pdf());
    await h.service.receive(USER, pdf());

    expect(h.drafts).toHaveLength(1);
  });

  test('другой файл — другой черновик', async () => {
    const h = harness();

    await h.service.receive(USER, pdf());
    await h.service.receive(USER, pdf({file_unique_id: 'AQADxyz'}));

    expect(h.drafts).toHaveLength(2);
  });
});

describe('AC-4: до подтверждения ничего не сохранено', () => {
  test('после разбора документ пользователя не изменился', async () => {
    const h = harness();

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);

    expect(h.savedFor(USER)).toHaveLength(0);
  });

  test('разобранное лежит в черновике, а не в документе', async () => {
    const h = harness();

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);

    expect(h.drafts[0].rows?.length).toBeGreaterThan(0);
    expect(h.drafts[0].status).toBe('parsed');
  });
});

describe('AC-5: подтверждение сохраняет, отмена — нет', () => {
  test('после подтверждения показатели в документе', async () => {
    const h = harness();

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    await h.service.confirm(draftId!);

    expect(h.savedFor(USER)).toHaveLength(4);
    expect(h.savedFor(USER)[0]).toEqual(expect.objectContaining({
      name: 'Билирубин общий', value: '8.04', date: '2026-10-21',
    }));
  });

  test('у сохранённого показателя стоит дата анализа, а не дата загрузки', () => {
    // Дата из файла — 21.10.2026, «сегодня» в тесте — 04.11.2026.
    const h = harness();

    return (async () => {
      const {draftId} = await h.service.receive(USER, pdf());
      await h.service.parse(draftId!);
      await h.service.confirm(draftId!);

      expect(h.savedFor(USER).every(r => r.date === '2026-10-21')).toBe(true);
    })();
  });

  test('после отмены в документе ничего нет, черновик закрыт', async () => {
    const h = harness();

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    await h.service.cancel(draftId!);

    expect(h.savedFor(USER)).toHaveLength(0);
    expect(h.drafts[0].status).toBe('failed');
  });

  test('подтвердить дважды нельзя — записи не удваиваются', async () => {
    const h = harness();

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    await h.service.confirm(draftId!);
    await h.service.confirm(draftId!);

    expect(h.savedFor(USER)).toHaveLength(4);
  });
});

describe('AC-6: нет даты в файле', () => {
  test('разбор просит дату и не сохраняет', async () => {
    const h = harness();
    h.setItems(fixture('noDate'));

    const {draftId} = await h.service.receive(USER, pdf());
    const reply = await h.service.parse(draftId!);

    expect(reply.expects).toBe('date');
    expect(h.drafts[0].status).toBe('awaiting_date');
    expect(h.savedFor(USER)).toHaveLength(0);
  });

  test('подтверждение без даты не сохраняет', async () => {
    const h = harness();
    h.setItems(fixture('noDate'));

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    await h.service.confirm(draftId!);

    expect(h.savedFor(USER)).toHaveLength(0);
  });

  test('после указания даты показатели сохраняются с ней', async () => {
    const h = harness();
    h.setItems(fixture('noDate'));

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    await h.service.setDate(USER, '2026-10-30');
    await h.service.confirm(draftId!);

    expect(h.savedFor(USER)[0].date).toBe('2026-10-30');
  });

  test('§9: «сегодня» для проверки даты берётся в поясе пользователя', async () => {
    // Человек восточнее UTC: у него уже 5 ноября, и эта дата должна приниматься.
    const h = harness({userToday: async () => '2026-11-05'});
    h.setItems(fixture('noDate'));

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    const reply = await h.service.setDate(USER, '2026-11-05');

    expect(reply.key).not.toBe('lab_date_invalid');
  });

  test('дата из будущего не принимается', async () => {
    const h = harness();
    h.setItems(fixture('noDate'));

    const {draftId} = await h.service.receive(USER, pdf());
    await h.service.parse(draftId!);
    const reply = await h.service.setDate(USER, '2026-12-01');

    expect(reply.key).toBe('lab_date_invalid');
    expect(h.drafts[0].date).toBeUndefined();
  });
});

describe('AC-8: разобрать не удалось', () => {
  test('у скана — отказ, документ не изменился', async () => {
    const h = harness();
    h.setItems([]);

    const {draftId} = await h.service.receive(USER, pdf());
    const reply = await h.service.parse(draftId!);

    expect(reply.key).toBe('lab_parse_failed');
    expect(h.drafts[0].status).toBe('failed');
    expect(h.savedFor(USER)).toHaveLength(0);
  });

  test('в файле нет анализов — тот же отказ', async () => {
    const h = harness();
    h.setItems(fixture('prose'));

    const {draftId} = await h.service.receive(USER, pdf());
    const reply = await h.service.parse(draftId!);

    expect(reply.key).toBe('lab_parse_failed');
  });

  test('ошибка скачивания не остаётся без ответа (§10)', async () => {
    const h = harness({downloadFile: async () => { throw new Error('ECONNRESET'); }});

    const {draftId} = await h.service.receive(USER, pdf());
    const reply = await h.service.parse(draftId!);

    expect(reply.key).toBe('lab_parse_failed');
    expect(h.drafts[0].status).toBe('failed');
  });
});

describe('AC-7: дубль при повторном подтверждении', () => {
  test('тот же файл, загруженный заново, не удваивает записи', async () => {
    const h = harness();

    const first = await h.service.receive(USER, pdf());
    await h.service.parse(first.draftId!);
    await h.service.confirm(first.draftId!);

    const second = await h.service.receive(USER, pdf({file_unique_id: 'AQADsecond'}));
    await h.service.parse(second.draftId!);
    await h.service.confirm(second.draftId!);

    expect(h.savedFor(USER)).toHaveLength(4);
  });
});

describe('§5: черновик, зависший после рестарта', () => {
  test('разбор, не доживший до конца, становится неудачей с ответом человеку', async () => {
    const h = harness();
    await h.service.receive(USER, pdf());

    const recovered = await h.service.recoverStale();

    expect(recovered).toHaveLength(1);
    expect(recovered[0].reply.key).toBe('lab_interrupted');
    expect(h.drafts[0].status).toBe('failed');
    expect(h.drafts[0].failureCode).toBe('interrupted');
  });

  test('файл заново не качается — своей копии у нас нет', async () => {
    const h = harness();
    await h.service.receive(USER, pdf());

    await h.service.recoverStale();

    expect(h.downloaded).toHaveLength(0);
  });
});

describe('AC-10: медицинские данные не попадают в логи', () => {
  const sensitive = [
    'Билирубин', '8.04', 'мкмоль/л', 'Иванова_анализы.pdf', 'Гомоцистеин',
  ];

  const recordLogs = () => {
    const lines: string[] = [];
    const sinks = ['log', 'info', 'warn', 'error', 'debug'] as const;
    const originals = sinks.map(name => [name, console[name]] as const);
    sinks.forEach(name => {
      console[name] = (...args: unknown[]) => { lines.push(args.map(String).join(' ')); };
    });

    return {
      lines,
      restore: () => originals.forEach(([name, fn]) => { console[name] = fn; }),
    };
  };

  const expectClean = (lines: string[]) => {
    const text = lines.join('\n');
    for (const fragment of sensitive) {
      expect(text).not.toContain(fragment);
    }
  };

  test('успешный путь не пишет в логи ни названий, ни значений, ни имени файла', async () => {
    const h = harness();
    const logs = recordLogs();

    try {
      const {draftId} = await h.service.receive(USER, pdf());
      await h.service.parse(draftId!);
      await h.service.confirm(draftId!);
    } finally {
      logs.restore();
    }

    expectClean(logs.lines);
  });

  test('неудача разбора логируется кодом, а не текстом исключения', async () => {
    // Текст ошибки библиотеки может содержать фрагмент файла (§14).
    const h = harness({
      extractTextItems: async () => { throw new Error('bad XRef entry: Билирубин 8.04'); },
    });
    const logs = recordLogs();

    try {
      const {draftId} = await h.service.receive(USER, pdf());
      await h.service.parse(draftId!);
    } finally {
      logs.restore();
    }

    expectClean(logs.lines);
  });

  test('отказ по типу файла не пишет имя файла', async () => {
    const h = harness();
    const logs = recordLogs();

    try {
      await h.service.receive(USER, pdf({mime_type: 'image/jpeg'}));
    } finally {
      logs.restore();
    }

    expectClean(logs.lines);
  });
});
