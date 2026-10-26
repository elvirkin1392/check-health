import {Settings} from "luxon";
import {getMessageTemplate} from './getMessageTemplate.tsx';
import {Command} from "../enums/Command.tsx";
import {MessageType} from "../enums/MessageType.tsx";
import {CreateStatus} from "../enums/Statuses.tsx";
import {DEFAULT_TIME_ZONE, TIME_ZONE_OPTIONS} from "./reminderSchedule.tsx";

describe('getMessageTemplate', () => {
  test('getMessageTemplate', () => {
    expect(getMessageTemplate(Command.Start, {status: CreateStatus.Failed, lang: 'en'}))
      .toStrictEqual({ text: "Sorry but I couldn't create your profile. \nType 'bug_rescue' to get help from the beloved developer"});
  });

  test('returns undefined instead of throwing for an unknown command', () => {
    expect(getMessageTemplate('/some_typo')).toBeUndefined();
  });
})

describe('calendar', () => {
  const dayButtons = (rows: any[]) =>
    rows.slice(2).flat().filter((btn) => JSON.parse(btn.callback_data).command === Command.ColdStart);

  test('renders every day of a fully past month as pickable', () => {
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2020, month: 2, lang: 'en'});
    const buttons = dayButtons(result.reply_markup.inline_keyboard);

    expect(buttons).toHaveLength(29); // February 2020 — leap year
    expect(buttons.map((b) => JSON.parse(b.callback_data).value)).toContain('2020-02-29');
  });

  test('every day row has exactly 7 cells', () => {
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2020, month: 2, lang: 'en'});
    result.reply_markup.inline_keyboard.slice(2).forEach((row: any[]) => {
      expect(row).toHaveLength(7);
    });
  });

  test('does not offer future dates as pickable', () => {
    // Момент и зона зафиксированы: ожидание брало локальный день машины, а гейт
    // считает день по поясу, поэтому на машине не в UTC тест падал по ночам.
    Settings.now = () => Date.UTC(2026, 9, 9, 21, 0, 0);
    Settings.defaultZone = 'UTC';

    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2026, month: 10, lang: 'en'});
    const buttons = dayButtons(result.reply_markup.inline_keyboard);

    expect(buttons).toHaveLength(9);
  });

  test('month navigation wraps the year forward at December', () => {
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2020, month: 12, lang: 'en'});
    const [, , nextButton] = result.reply_markup.inline_keyboard[0];

    expect(JSON.parse(nextButton.callback_data).value).toEqual({t: 's', y: 2021, m: 1});
  });

  test('month navigation wraps the year backward at January', () => {
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2021, month: 1, lang: 'en'});
    const [prevButton] = result.reply_markup.inline_keyboard[0];

    expect(JSON.parse(prevButton.callback_data).value).toEqual({t: 's', y: 2020, m: 12});
  });

  test('keeps every button under Telegram\'s 64-byte callback_data limit', () => {
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: 2020, month: 12, lang: 'ru'});
    const allButtons = result.reply_markup.inline_keyboard.flat();

    allButtons.forEach((btn: any) => {
      expect(Buffer.byteLength(btn.callback_data, 'utf8')).toBeLessThanOrEqual(64);
    });
  });
})

describe('timezone keyboard', () => {
  const keyboard = (value?: string) =>
    getMessageTemplate(Command.TimeZone, {value, lang: 'en'}).reply_markup.inline_keyboard;

  test('offers every supported zone', () => {
    const values = keyboard().flat().map((btn: any) => JSON.parse(btn.callback_data).value);

    expect(values).toEqual(TIME_ZONE_OPTIONS);
  });

  test('every button carries the timezone command', () => {
    keyboard().flat().forEach((btn: any) => {
      expect(JSON.parse(btn.callback_data).command).toBe(Command.TimeZone);
    });
  });

  test("keeps every button under Telegram's 64-byte callback_data limit", () => {
    keyboard().flat().forEach((btn: any) => {
      expect(Buffer.byteLength(btn.callback_data, 'utf8')).toBeLessThanOrEqual(64);
    });
  });

  test('labels a zone with its city and current offset', () => {
    const moscow = keyboard().flat()
      .find((btn: any) => JSON.parse(btn.callback_data).value === 'Europe/Moscow');

    expect(moscow.text).toBe('Moscow +03:00');
  });

  test('tells a user with no stored zone that UTC is in effect', () => {
    expect(getMessageTemplate(Command.TimeZone, {value: undefined, lang: 'en'}).text)
      .toContain(DEFAULT_TIME_ZONE);
  });

  test('shows the stored zone when there is one', () => {
    expect(getMessageTemplate(Command.TimeZone, {value: 'Asia/Tokyo', lang: 'en'}).text)
      .toContain('Asia/Tokyo');
  });
})

// --- Спецификация 002: день болезни считается по календарю пользователя ---
//
// Сервер на Cloud Run работает в UTC, а машина разработчика может стоять в UTC+5 —
// в том же поясе, что и Asia/Tashkent из критериев. Поэтому зона прибивается явно:
// иначе багованный код прошёл бы локально и упал в CI.
const SERVER_ZONE = 'UTC';

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

// По UTC ещё 9 октября 21:00, в Asia/Tashkent уже 10 октября 02:00.
const EVENING_IN_UTC_PLUS_5 = Date.UTC(2026, 9, 9, 21, 0, 0);
// По UTC уже 10 октября 02:00, в America/Los_Angeles ещё 9 октября 19:00.
const NIGHT_WHEN_UTC_IS_AHEAD = Date.UTC(2026, 9, 10, 2, 0, 0);

const quickButtons = (command: string, timeZone: string) =>
  getMessageTemplate(command, {lang: 'en', timeZone}).reply_markup.inline_keyboard;

// Даты, которые в календаре можно выбрать: у них callback_data несёт саму дату,
// а у недоступных дней — навигацию по месяцу.
const pickableDates = (target: string, params: any): string[] =>
  getMessageTemplate(MessageType.Calendar, {target, lang: 'en', ...params})
    .reply_markup.inline_keyboard
    .slice(2)
    .flat()
    .filter((btn: any) => JSON.parse(btn.callback_data).command === target)
    .map((btn: any) => JSON.parse(btn.callback_data).value);

describe('002: даты кнопок в поясе пользователя', () => {
  test('AC-1: «первый день» записывает сегодня пользователя, а не сервера', () => {
    freezeAt(EVENING_IN_UTC_PLUS_5);
    const [firstDay] = quickButtons(Command.ColdStart, 'Asia/Tashkent')[0];

    expect(JSON.parse(firstDay.callback_data).value).toBe('2026-10-10');
  });

  test('AC-2: «со вчера» записывает день, предшествующий сегодня пользователя', () => {
    freezeAt(EVENING_IN_UTC_PLUS_5);
    const [, yesterday] = quickButtons(Command.ColdStart, 'Asia/Tashkent')[0];

    expect(JSON.parse(yesterday.callback_data).value).toBe('2026-10-09');
  });

  test('AC-3: «сегодня» при закрытии болезни записывает сегодня пользователя', () => {
    freezeAt(EVENING_IN_UTC_PLUS_5);
    const [today] = quickButtons(Command.ColdEnd, 'Asia/Tashkent')[0];

    expect(JSON.parse(today.callback_data).value).toBe('2026-10-10');
  });

  test('AC-6: календарь открывается на месяце пользователя', () => {
    // 31 октября 21:00 UTC — в Ташкенте уже 1 ноября.
    freezeAt(Date.UTC(2026, 9, 31, 21, 0, 0));
    const [pickADate] = quickButtons(Command.ColdStart, 'Asia/Tashkent')[1];

    expect(JSON.parse(pickADate.callback_data).value).toEqual({t: 's', y: 2026, m: 11});
  });
});

describe('002: гейт будущих дней в календаре', () => {
  test('AC-4: сегодня пользователя выбираемо, завтра — нет', () => {
    freezeAt(EVENING_IN_UTC_PLUS_5);
    const dates = pickableDates(Command.ColdStart, {year: 2026, month: 10, timeZone: 'Asia/Tashkent'});

    expect(dates).toContain('2026-10-10');
    expect(dates).not.toContain('2026-10-11');
  });

  test('AC-5: западнее UTC день, ещё не наступивший у пользователя, недоступен', () => {
    freezeAt(NIGHT_WHEN_UTC_IS_AHEAD);
    const dates = pickableDates(Command.ColdStart, {year: 2026, month: 10, timeZone: 'America/Los_Angeles'});

    expect(dates).toContain('2026-10-09');
    expect(dates).not.toContain('2026-10-10');
  });

  test('без пояса календарь ведёт себя как раньше — по UTC', () => {
    freezeAt(EVENING_IN_UTC_PLUS_5);
    const dates = pickableDates(Command.ColdStart, {year: 2026, month: 10, timeZone: undefined});

    expect(dates).toContain('2026-10-09');
    expect(dates).not.toContain('2026-10-10');
  });
});
