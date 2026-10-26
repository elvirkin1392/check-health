import {Settings} from "luxon";

// Моки только на границах (§4): база, Telegram API и планировщик.
// Сама проводка пояса в расчёты — то, что проверяется.
jest.mock('./telegram.api.tsx', () => ({sendMessage: jest.fn()}));
jest.mock('../cron/main.tsx', () => ({toggleJob: jest.fn(), rescheduleUserJobs: jest.fn()}));
jest.mock('./telegram.db.tsx', () => ({
  getDbUserLang: jest.fn(),
  getDbUserTimeZone: jest.fn(),
  getDbLastIllDay: jest.fn(),
  getDbIllPeriods: jest.fn(),
  getDbLastIllPeriod: jest.fn(),
  createDbUser: jest.fn(),
  updateDbData: jest.fn(),
}));

import {sendResponseToCommand} from './telegram.service.tsx';
import {sendMessage} from './telegram.api.tsx';
import {getDbUserLang, getDbUserTimeZone, getDbLastIllDay, getDbIllPeriods} from './telegram.db.tsx';

const userTg: any = {id: 42, is_bot: false, first_name: 'T', language_code: 'en'};

// Вечер в UTC+5: по UTC ещё 9 октября, в Asia/Tashkent уже 10-е.
const EVENING_IN_UTC_PLUS_5 = Date.UTC(2026, 9, 9, 21, 0, 0);
const USER_TODAY = '2026-10-10';
const SERVER_TODAY = '2026-10-09';

const originalNow = Settings.now;
const originalZone = Settings.defaultZone;

beforeEach(() => {
  jest.clearAllMocks();
  Settings.now = () => EVENING_IN_UTC_PLUS_5;
  Settings.defaultZone = 'UTC'; // сервер Cloud Run
  (getDbUserLang as jest.Mock).mockResolvedValue('en');
  (getDbUserTimeZone as jest.Mock).mockResolvedValue('Asia/Tashkent');
});

afterEach(() => {
  Settings.now = originalNow;
  Settings.defaultZone = originalZone;
});

const sentText = () => (sendMessage as jest.Mock).mock.calls[0][1].text;

describe('пояс пользователя доходит до расчётов, а не теряется в сервисе', () => {
  test('день пользователя передаётся в слой базы', async () => {
    (getDbLastIllDay as jest.Mock).mockResolvedValue('2026-10-01');

    await sendResponseToCommand(userTg, '/healthy_days');

    expect(getDbLastIllDay).toHaveBeenCalledWith(userTg, USER_TODAY);
    expect(getDbLastIllDay).not.toHaveBeenCalledWith(userTg, SERVER_TODAY);
  });

  test('здоровые дни считаются до дня пользователя', async () => {
    (getDbLastIllDay as jest.Mock).mockResolvedValue('2026-10-01');

    await sendResponseToCommand(userTg, '/healthy_days');

    // До 10 октября — девять дней. По серверному дню вышло бы восемь.
    expect(sentText()).toContain('9');
  });

  test('статистика за год отсчитывается от дня пользователя', async () => {
    // Период пересекает границу года: ответ зависит от того, где эта граница.
    (getDbIllPeriods as jest.Mock).mockResolvedValue([{start_date: '2025-10-05', end_date: '2025-10-12'}]);

    await sendResponseToCommand(userTg, '/healthy_year');

    // Граница 2025-10-10 даёт 363; по серверному дню граница 2025-10-09 дала бы 362.
    expect(sentText()).toContain('363');
  });

  test('без сохранённого пояса расчёт идёт по UTC', async () => {
    (getDbUserTimeZone as jest.Mock).mockResolvedValue(undefined);
    (getDbLastIllDay as jest.Mock).mockResolvedValue('2026-10-01');

    await sendResponseToCommand(userTg, '/healthy_days');

    expect(getDbLastIllDay).toHaveBeenCalledWith(userTg, SERVER_TODAY);
  });
});

describe('пояс доходит до клавиатуры', () => {
  test('кнопка «первый день» предлагает день пользователя', async () => {
    await sendResponseToCommand(userTg, '/cold_start');

    const [firstDay] = (sendMessage as jest.Mock).mock.calls[0][1].reply_markup.inline_keyboard[0];

    expect(JSON.parse(firstDay.callback_data).value).toBe(USER_TODAY);
  });
});
