import {getQuery, getColdStartQuery} from './dbQueries';
import {Command} from "../enums/Command";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";

const userWith = (ill_periods: any[]): UserDoc => ({
  bio: {id: 1, is_bot: false, first_name: 'T'},
  blood_tests: [],
  ill_periods,
  woman_days: [],
  loginCode: '',
} as UserDoc);

describe('AC-13: смена пояса не трогает сохранённые даты', () => {
  const stored = [{start_date: '2026-10-01', end_date: '2026-10-09'}];

  test('запрос на смену пояса меняет только пояс', () => {
    const query = getQuery(userWith(stored), Command.TimeZone, {timeZone: 'Asia/Tashkent'});

    expect(query).toEqual({$set: {timeZone: 'Asia/Tashkent'}});
  });

  test('в запросе не упоминаются ни периоды, ни их даты', () => {
    const serialised = JSON.stringify(getQuery(userWith(stored), Command.TimeZone, {timeZone: 'America/Los_Angeles'}));

    expect(serialised).not.toContain('ill_periods');
    expect(serialised).not.toContain('2026-10-01');
    expect(serialised).not.toContain('2026-10-09');
  });

  test('повторная смена пояса тоже ничего не пересчитывает', () => {
    const first = getQuery(userWith(stored), Command.TimeZone, {timeZone: 'Asia/Tashkent'});
    const second = getQuery(userWith(stored), Command.TimeZone, {timeZone: 'UTC'});

    expect(first).toEqual({$set: {timeZone: 'Asia/Tashkent'}});
    expect(second).toEqual({$set: {timeZone: 'UTC'}});
  });
});

// Решение «та же болезнь или новая» раньше вычиталось из серверного «сейчас».
// Теперь сравниваются две календарные даты, обе выбранные пользователем.
describe('cold_start при уже открытом периоде', () => {
  const open = userWith([{start_date: '2026-10-10', end_date: null}]);

  test('тот же день — нового периода не создаётся', () => {
    expect(getColdStartQuery(open, Command.ColdStart, {start_date: '2026-10-10', end_date: null}))
      .toBeUndefined();
  });

  test('следующий день — тоже не создаётся: прошло не больше суток', () => {
    expect(getColdStartQuery(open, Command.ColdStart, {start_date: '2026-10-11', end_date: null}))
      .toBeUndefined();
  });

  test('через три дня — прежний период закрывается, создаётся новый', () => {
    const query = getColdStartQuery(open, Command.ColdStart, {start_date: '2026-10-13', end_date: null});

    expect(Array.isArray(query)).toBe(true);
    expect(query[0]).toEqual({$push: {ill_periods: {start_date: '2026-10-13', end_date: null}}});
    expect(query[1]).toEqual({$set: {'ill_periods.0.end_date': '2026-10-10'}});
  });

  test('решение не зависит от часов сервера', () => {
    // Дата пользователя может опережать серверный день — раньше разница уходила
    // в минус и новый период молча не создавался.
    const sameAnswer = getColdStartQuery(open, Command.ColdStart, {start_date: '2026-10-13', end_date: null});

    expect(Array.isArray(sameAnswer)).toBe(true);
  });
});

describe('cold_start без открытого периода', () => {
  test('период просто добавляется', () => {
    const closed = userWith([{start_date: '2026-09-01', end_date: '2026-09-05'}]);

    expect(getColdStartQuery(closed, Command.ColdStart, {start_date: '2026-10-10', end_date: null}))
      .toEqual({$push: {ill_periods: {start_date: '2026-10-10', end_date: null}}});
  });
});
