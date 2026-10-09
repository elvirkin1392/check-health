import {getResponseToInlineButton} from './getResponseToInlineButton.tsx';
import {Command} from "../enums/Command.tsx";
import {MessageType} from "../enums/MessageType.tsx";
import {DAILY_REMINDER_CRON, DEFAULT_TIME_ZONE} from "./reminderSchedule.tsx";

describe('cold_start reminder job', () => {
  const jobConfig = (timeZone?: string) =>
    getResponseToInlineButton(Command.ColdStart, '2026-10-09', 'en', timeZone).jobConfig;

  test('schedules the reminder once a day, not once a minute', () => {
    expect(jobConfig('Europe/Moscow').cronTime).toBe(DAILY_REMINDER_CRON);
  });

  test('schedules it in the time zone the user has set', () => {
    expect(jobConfig('Europe/Moscow').timeZone).toBe('Europe/Moscow');
  });

  test('falls back to UTC for a user who never told us a zone', () => {
    expect(jobConfig(undefined).timeZone).toBe(DEFAULT_TIME_ZONE);
  });

  test('ignores a zone the server cannot resolve', () => {
    expect(jobConfig('Mordor/Barad-dur').timeZone).toBe(DEFAULT_TIME_ZONE);
  });

  test('still opens the illness period and asks about health', () => {
    const response = getResponseToInlineButton(Command.ColdStart, '2026-10-09', 'en', 'Asia/Tokyo');

    expect(response.updateData).toEqual({start_date: '2026-10-09', end_date: null});
    expect(response.jobConfig.type).toBe(MessageType.CheckHealth);
  });

  test('offers a calendar instead of a job when no date was picked yet', () => {
    const response = getResponseToInlineButton(Command.ColdStart, undefined, 'en', 'Asia/Tokyo');

    expect(response.jobConfig).toBeUndefined();
    expect(response.closeSession.reply_markup).toBeDefined();
  });
});

describe('timezone button', () => {
  test('stores a valid zone and asks for running jobs to be rescheduled', () => {
    const response = getResponseToInlineButton(Command.TimeZone, 'Asia/Tokyo', 'en');

    expect(response.updateData).toEqual({timeZone: 'Asia/Tokyo'});
    expect(response.rescheduleJobs).toBe(true);
    expect(response.closeSession.text).toContain('Asia/Tokyo');
  });

  test('stores nothing and reschedules nothing for a zone it cannot resolve', () => {
    const response = getResponseToInlineButton(Command.TimeZone, 'Europe/Atlantis', 'en');

    expect(response.updateData).toBeUndefined();
    expect(response.rescheduleJobs).toBeUndefined();
    expect(response.closeSession.text).toBeDefined();
  });

  test('lets a user opt back into UTC', () => {
    const response = getResponseToInlineButton(Command.TimeZone, DEFAULT_TIME_ZONE, 'en');

    expect(response.updateData).toEqual({timeZone: DEFAULT_TIME_ZONE});
    expect(response.rescheduleJobs).toBe(true);
  });

  test('answers in the user language', () => {
    const response = getResponseToInlineButton(Command.TimeZone, 'Europe/Atlantis', 'ru');

    expect(response.closeSession.text).toBe('Не знаю такой часовой пояс. Выберите из кнопок.');
  });
});

describe('closing an illness period', () => {
  test('cold_end stops the reminder job', () => {
    const response = getResponseToInlineButton(Command.ColdEnd, '2026-10-10', 'en', 'Asia/Tokyo');

    expect(response.jobConfig).toEqual({shouldStop: true, type: MessageType.CheckHealth});
  });

  test('answering "good" stops the reminder job', () => {
    const response = getResponseToInlineButton(MessageType.CheckHealth, '2026-10-10', 'en');

    expect(response.jobConfig).toEqual({shouldStop: true, type: MessageType.CheckHealth});
  });

  test('answering "still bad" leaves the job running', () => {
    expect(getResponseToInlineButton(MessageType.CheckHealth, false, 'en')).toEqual({});
  });
});
