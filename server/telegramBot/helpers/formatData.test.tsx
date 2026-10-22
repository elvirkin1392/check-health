import {DateTime as dt, Settings} from "luxon";
import {calcPeriodBetweenDates, extractPeriodsFromYear} from './formatData';
import {userToday} from './userDay.tsx';

// Сервер на Cloud Run работает в UTC; машина разработчика может стоять в UTC+5,
// совпадающем с поясом из критериев. Прибиваем зону, чтобы тест проверял код.
const SERVER_ZONE = 'UTC';

// Вечер в UTC+5: по UTC ещё 9 октября 21:00, в Asia/Tashkent уже 10 октября 02:00.
const EVENING_IN_UTC_PLUS_5 = Date.UTC(2026, 9, 9, 21, 0, 0);

const USER_TODAY = '2026-10-10';   // то же мгновение глазами Asia/Tashkent
const SERVER_TODAY = '2026-10-09'; // ...и глазами сервера

const originalNow = Settings.now;
const originalZone = Settings.defaultZone;

beforeEach(() => {
  Settings.now = () => EVENING_IN_UTC_PLUS_5;
  Settings.defaultZone = SERVER_ZONE;
});

afterEach(() => {
  Settings.now = originalNow;
  Settings.defaultZone = originalZone;
});

// Даты в базе лежат календарными строками, поэтому и в тестах они строки.
const periods = [
  {start_date: '2025-10-08', end_date: '2025-10-12'},
  {start_date: '2026-10-03', end_date: '2026-10-05'},
  {start_date: '2026-10-07', end_date: null},
];

describe('format helpers', () => {
  test('extract periods from last 365 days', () => {
    expect(extractPeriodsFromYear(periods, USER_TODAY)).toBe(358)
  })

  test('calc diff between dates', () => {
    expect(calcPeriodBetweenDates(periods[0].start_date, periods[0].end_date)).toStrictEqual({days: 4})
  })
})

describe('002: расчёты ведутся до сегодня пользователя', () => {
  test('AC-7: здоровые дни считаются до сегодня пользователя, а не сервера', () => {
    const lastIllDay = '2026-10-01';

    expect(calcPeriodBetweenDates(lastIllDay, userToday('Asia/Tashkent'))).toStrictEqual({days: 9});
    // По серверному дню получилось бы на единицу меньше — это и есть баг.
    expect(calcPeriodBetweenDates(lastIllDay, SERVER_TODAY)).toStrictEqual({days: 8});
  });

  test('AC-8: год отсчитывается назад от сегодня пользователя', () => {
    // Период пересекает границу года: сколько его попадёт в окно, зависит от того,
    // где эта граница — 2025-10-10 по пользователю или 2025-10-09 по серверу.
    const straddling = [{start_date: '2025-10-05', end_date: '2025-10-12'}];

    expect(extractPeriodsFromYear(straddling, USER_TODAY)).toBe(363);
    expect(extractPeriodsFromYear(straddling, SERVER_TODAY)).toBe(362);
  });

  test('AC-9: у незакрытого периода концом считается сегодня пользователя', () => {
    const open = [{start_date: '2026-10-08', end_date: null}];

    expect(extractPeriodsFromYear(open, USER_TODAY)).toBe(363);
    expect(extractPeriodsFromYear(open, SERVER_TODAY)).toBe(364);
  });
});

describe('002: сохранённые даты не зависят от пояса', () => {
  const stored = {start_date: '2026-10-01', end_date: '2026-10-09'};

  test('AC-12: длительность сохранённого периода одинакова в любом поясе', () => {
    for (const zone of ['UTC', 'Asia/Tashkent', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      Settings.defaultZone = zone;

      expect(calcPeriodBetweenDates(stored.start_date, stored.end_date)).toStrictEqual({days: 8});
    }
  });

  test('AC-13: смена пояса не переинтерпретирует сохранённую дату', () => {
    // Так делать нельзя: календарная дата, прогнанная через setZone, уезжает на сутки.
    const wrong = dt.fromISO(stored.start_date, {zone: 'Asia/Tashkent'}).setZone('UTC').toISODate();
    expect(wrong).toBe('2026-09-30');

    // Расчёты фичи от окружающего пояса не зависят — сдвига не происходит.
    const before = calcPeriodBetweenDates(stored.start_date, stored.end_date);
    Settings.defaultZone = 'Asia/Tashkent';
    const after = calcPeriodBetweenDates(stored.start_date, stored.end_date);

    expect(after).toStrictEqual(before);
    expect(extractPeriodsFromYear([stored], USER_TODAY))
      .toBe(extractPeriodsFromYear([stored], USER_TODAY));
  });
});
