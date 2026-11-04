// AC-8 целиком: человек переключает язык в Mini App, затем пишет боту — и бот
// отвечает на новом языке. Проверка идёт через оба модуля, потому что весь
// смысл FR-4 в том, что поле одно: тест только на стороне Mini App доказал бы,
// что значение записано, но не что бот его читает.

import {ObjectId} from 'mongodb';

const stored: {lang?: string} = {};

// Мок на границе базы (§4): одна «коллекция» на оба модуля, запись из Mini App
// видна чтению бота — ровно как один документ в Mongo.
jest.mock('../../db/dbClient.tsx', () => ({
  db: {
    collection: () => ({
      findOne: async () => stored,
    }),
  },
}));

import {ProfileService} from './profile.service.tsx';
import {ProfileDbApi} from './profile.db.tsx';
import {getDbUserLang} from '../../telegramBot/telegram.db.tsx';
import {User} from '../../telegramBot/telegram.types.tsx';

const profileDb: ProfileDbApi = {
  getProfileById: async () => null,
  saveLanguage: async (_id, lang) => { stored.lang = lang; },
};

const userTg = (language_code?: string): User =>
  ({id: 1, is_bot: false, first_name: 'T', language_code} as User);

const userId = new ObjectId().toHexString();

describe('AC-8: язык из Mini App действует и в боте', () => {
  beforeEach(() => { delete stored.lang; });

  test('после переключения на русский бот отвечает по-русски', async () => {
    // У человека английский клиент Telegram — чтобы русский мог прийти
    // только из его выбора, а не из `language_code`.
    expect(await getDbUserLang(userTg('en'))).toBe('en');

    await ProfileService({profileDb}).setLanguage(userId, 'ru');

    expect(await getDbUserLang(userTg('en'))).toBe('ru');
  });

  test('переключение обратно тоже доходит до бота', async () => {
    const service = ProfileService({profileDb});

    await service.setLanguage(userId, 'ru');
    await service.setLanguage(userId, 'en');

    expect(await getDbUserLang(userTg('ru'))).toBe('en');
  });

  test('выбор в Mini App важнее языка клиента Telegram', async () => {
    await ProfileService({profileDb}).setLanguage(userId, 'en');

    expect(await getDbUserLang(userTg('ru'))).toBe('en');
  });
});
