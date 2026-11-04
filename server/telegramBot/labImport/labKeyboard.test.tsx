import {buildLabKeyboard, getMessageTemplate} from '../helpers/getMessageTemplate.tsx';
import {Command} from '../enums/Command.tsx';
import {MessageType} from '../enums/MessageType.tsx';

// Telegram обрезает `callback_data` на 64 байтах, и кнопка молча перестаёт
// работать. Номер черновика — восемь hex-символов (§11).
const LIMIT = 64;
const DRAFT = 'a1b2c3d4';

const callbackData = (keyboard: {inline_keyboard: unknown[][]}): string[] =>
  keyboard.inline_keyboard
    .flat()
    .map(button => (button as {callback_data?: string}).callback_data)
    .filter((data): data is string => typeof data === 'string');

describe('§11: кнопки подтверждения файла', () => {
  test('каждая кнопка влезает в 64 байта', () => {
    for (const data of callbackData(buildLabKeyboard(DRAFT, 'ru'))) {
      expect(Buffer.byteLength(data)).toBeLessThanOrEqual(LIMIT);
    }
  });

  test('кнопок две: подтвердить и отменить', () => {
    const commands = callbackData(buildLabKeyboard(DRAFT, 'ru'))
      .map(data => JSON.parse(data).command);

    expect(commands).toEqual(
      expect.arrayContaining([Command.LabConfirm, Command.LabCancel]),
    );
  });

  test('кнопка несёт номер черновика', () => {
    const values = callbackData(buildLabKeyboard(DRAFT, 'ru'))
      .map(data => JSON.parse(data).value);

    expect(values).toContain(DRAFT);
  });

  test('подписи кнопок переводятся (§12)', () => {
    const labels = (lang: 'ru' | 'en') => buildLabKeyboard(DRAFT, lang)
      .inline_keyboard.flat().map(b => (b as {text: string}).text).join('|');

    expect(labels('ru')).not.toBe(labels('en'));
  });
});

describe('§11: календарь для даты анализа', () => {
  const calendar = () => getMessageTemplate(MessageType.Calendar, {
    target: Command.LabDate, year: 2026, month: 10, lang: 'ru',
  });

  test('каждая кнопка календаря влезает в 64 байта', () => {
    for (const data of callbackData(calendar().reply_markup)) {
      expect(Buffer.byteLength(data)).toBeLessThanOrEqual(LIMIT);
    }
  });

  test('кнопка дня несёт только дату — черновик берётся из базы', () => {
    // Вариант с номером черновика внутри кнопки занимает ровно 64 байта,
    // без запаса: удлинись номер на символ, и кнопка перестанет работать.
    const day = callbackData(calendar().reply_markup)
      .map(data => JSON.parse(data))
      .find(parsed => parsed.command === Command.LabDate);

    expect(typeof day?.value).toBe('string');
    expect(day?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('у навигации по месяцам остаётся запас до лимита', () => {
    // С полным именем цели внутри кнопки выходит 63 байта из 64 — один байт
    // запаса. Этого мало: любое будущее поле в кнопке сломает навигацию молча.
    // Короткий код цели (`s`, `e`, `l`) оставляет 56.
    const navigation = callbackData(calendar().reply_markup)
      .filter(data => JSON.parse(data).command === MessageType.Calendar);

    expect(navigation.length).toBeGreaterThan(0);
    for (const data of navigation) {
      expect(Buffer.byteLength(data)).toBeLessThanOrEqual(LIMIT - 8);
    }
  });
});
