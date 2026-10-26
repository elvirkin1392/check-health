import {ProfileService} from './profile.service.tsx';
import {ProfileDbApi} from './profile.db.tsx';

// Мок только на границе базы (§4). Логика выбора и записи — то, что проверяется.
const fakeDb = () => {
  const saved: {id: unknown, lang: string}[] = [];
  const db: ProfileDbApi = {
    getProfileById: async () => null,
    saveLanguage: async (id, lang) => { saved.push({id, lang}); },
  };
  return {db, saved};
};

describe('сохранение языка из Mini App', () => {
  test('AC-9: выбранный язык уходит в базу и переживает перезагрузку', async () => {
    const {db, saved} = fakeDb();

    const result = await ProfileService({profileDb: db}).setLanguage('507f1f77bcf86cd799439011', 'ru');

    expect(saved).toEqual([{id: '507f1f77bcf86cd799439011', lang: 'ru'}]);
    expect(result).toBe('ru');
  });

  test('AC-8: язык пишется в то же поле, которое читает бот', async () => {
    // Бот читает `lang` из документа пользователя. Отдельного поля для Mini App нет,
    // поэтому «кто главнее» не возникает — побеждает последняя запись (FR-4).
    const {db, saved} = fakeDb();
    const service = ProfileService({profileDb: db});

    await service.setLanguage('507f1f77bcf86cd799439011', 'ru');
    await service.setLanguage('507f1f77bcf86cd799439011', 'en');

    expect(saved.map(s => s.lang)).toEqual(['ru', 'en']);
  });

  test('неподдерживаемый язык не сохраняется как есть', async () => {
    // Значение приходит от клиента, поэтому проверяется до записи (§13).
    const {db, saved} = fakeDb();

    const result = await ProfileService({profileDb: db}).setLanguage('507f1f77bcf86cd799439011', 'эльфийский');

    expect(result).toBe('en');
    expect(saved).toEqual([{id: '507f1f77bcf86cd799439011', lang: 'en'}]);
  });
});
