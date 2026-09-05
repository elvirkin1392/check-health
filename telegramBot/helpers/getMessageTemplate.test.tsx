import {getMessageTemplate} from './getMessageTemplate.tsx';
import {Command} from "../enums/Command.tsx";
import {MessageType} from "../enums/MessageType.tsx";
import {CreateStatus} from "../enums/Statuses.tsx";

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
    const now = new Date();
    const result = getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: now.getFullYear(), month: now.getMonth() + 1, lang: 'en'});
    const buttons = dayButtons(result.reply_markup.inline_keyboard);

    expect(buttons).toHaveLength(now.getDate());
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