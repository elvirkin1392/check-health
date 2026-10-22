import {Settings} from "luxon";
import {userToday, userYesterday, userTodayMonth} from './userDay.tsx';

// Сервер на Cloud Run работает в UTC. Машина разработчика может стоять в любом
// поясе — в том числе в UTC+5, совпадающем с поясом из критериев приёмки, — поэтому
// зона прибивается явно. Иначе тест проверял бы не код, а часы автора.
const SERVER_ZONE = 'UTC';

// Вечер в UTC+5: по UTC ещё 9 октября 21:00, в Asia/Tashkent уже 10 октября 02:00.
const EVENING_IN_UTC_PLUS_5 = Date.UTC(2026, 9, 9, 21, 0, 0);

const originalNow = Settings.now;
const originalZone = Settings.defaultZone;

const freezeAt = (millis: number) => {
  Settings.now = () => millis;
  Settings.defaultZone = SERVER_ZONE;
};

afterEach(() => {
  Settings.now = originalNow;
  Settings.defaultZone = originalZone;
});

describe('день пользователя', () => {
  beforeEach(() => freezeAt(EVENING_IN_UTC_PLUS_5));

  test('сегодня берётся в поясе пользователя, а не сервера', () => {
    expect(userToday('Asia/Tashkent')).toBe('2026-10-10');
    expect(userToday(SERVER_ZONE)).toBe('2026-10-09');
  });

  test('вчера — день, предшествующий сегодня пользователя', () => {
    expect(userYesterday('Asia/Tashkent')).toBe('2026-10-09');
  });

  test('месяц берётся в поясе пользователя', () => {
    expect(userTodayMonth('Asia/Tashkent')).toEqual({year: 2026, month: 10});
  });

  test('AC-10: без сохранённого пояса день считается по UTC', () => {
    expect(userToday(undefined)).toBe('2026-10-09');
    expect(userToday(null)).toBe('2026-10-09');
    expect(userToday('')).toBe('2026-10-09');
    expect(userYesterday(undefined)).toBe('2026-10-08');
  });

  test('AC-11: нераспознаваемый пояс считается по UTC', () => {
    expect(userToday('Mordor/Barad-dur')).toBe('2026-10-09');
    expect(userToday('UTC+5')).toBe('2026-10-09');
    expect(userYesterday('Mordor/Barad-dur')).toBe('2026-10-08');
  });
});

describe('месяц на границе', () => {
  test('у пользователя уже следующий месяц, а по UTC ещё предыдущий', () => {
    // 31 октября 21:00 UTC — в Ташкенте уже 1 ноября.
    freezeAt(Date.UTC(2026, 9, 31, 21, 0, 0));

    expect(userTodayMonth('Asia/Tashkent')).toEqual({year: 2026, month: 11});
    expect(userTodayMonth(SERVER_ZONE)).toEqual({year: 2026, month: 10});
  });

  test('у пользователя западнее ещё предыдущий год, а по UTC уже следующий', () => {
    // 1 января 02:00 UTC — в Лос-Анджелесе ещё 31 декабря.
    freezeAt(Date.UTC(2027, 0, 1, 2, 0, 0));

    expect(userTodayMonth('America/Los_Angeles')).toEqual({year: 2026, month: 12});
    expect(userToday('America/Los_Angeles')).toBe('2026-12-31');
  });
});
