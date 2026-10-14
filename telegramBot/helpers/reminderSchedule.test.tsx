import {DateTime as dt} from "luxon";
import {
  DAILY_REMINDER_CRON,
  DEFAULT_TIME_ZONE,
  TIME_ZONE_OPTIONS,
  getReminderSchedule,
  isValidTimeZone,
  needsReschedule,
  resolveTimeZone,
} from "./reminderSchedule";

const TEST_SCHEDULE = '10 * * * * *';

describe('DAILY_REMINDER_CRON', () => {
  it('is a six-field pattern firing once a day at 12:00', () => {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = DAILY_REMINDER_CRON.split(' ');

    expect(DAILY_REMINDER_CRON.split(' ')).toHaveLength(6);
    expect(second).toBe('0');
    expect(minute).toBe('0');
    expect(hour).toBe('12');
    expect([dayOfMonth, month, dayOfWeek]).toEqual(['*', '*', '*']);
  });

  it('is not the every-minute test schedule', () => {
    expect(DAILY_REMINDER_CRON).not.toBe(TEST_SCHEDULE);
  });
});

describe('resolveTimeZone', () => {
  it('keeps a valid IANA zone', () => {
    expect(resolveTimeZone('Europe/Moscow')).toBe('Europe/Moscow');
    expect(resolveTimeZone('America/Los_Angeles')).toBe('America/Los_Angeles');
  });

  it('falls back to UTC when the zone is unknown', () => {
    expect(resolveTimeZone(undefined)).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone(null)).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone('')).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone('Moscow')).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone('UTC+3')).toBe(DEFAULT_TIME_ZONE);
  });

  it('rejects anything that is not a zone name', () => {
    expect(isValidTimeZone('Europe/Moscow')).toBe(true);
    expect(isValidTimeZone('not/a/zone')).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });
});

describe('TIME_ZONE_OPTIONS', () => {
  it('offers only zones luxon can resolve', () => {
    for (const zone of TIME_ZONE_OPTIONS) {
      expect(resolveTimeZone(zone)).toBe(zone);
    }
  });

  it('includes the UTC fallback so a user can opt back into it', () => {
    expect(TIME_ZONE_OPTIONS).toContain(DEFAULT_TIME_ZONE);
  });
});

describe('getReminderSchedule', () => {
  it('pairs the daily pattern with the user zone', () => {
    expect(getReminderSchedule('Europe/Moscow')).toEqual({
      cronTime: DAILY_REMINDER_CRON,
      timeZone: 'Europe/Moscow',
    });
  });

  it('pairs the daily pattern with UTC when the user has no zone', () => {
    expect(getReminderSchedule(undefined)).toEqual({
      cronTime: DAILY_REMINDER_CRON,
      timeZone: DEFAULT_TIME_ZONE,
    });
  });

  it('means noon local time, not noon server time', () => {
    const {timeZone} = getReminderSchedule('Asia/Tashkent');
    const localNoon = dt.fromObject({hour: 12}, {zone: timeZone});

    // Tashkent is UTC+5 year round, so local noon is 07:00 UTC.
    expect(localNoon.toUTC().hour).toBe(7);
  });
});

describe('needsReschedule', () => {
  const wanted = getReminderSchedule('Europe/Moscow');

  it('flags a record left on the every-minute test schedule', () => {
    expect(needsReschedule({cronTime: TEST_SCHEDULE, timeZone: 'Europe/Moscow'}, wanted)).toBe(true);
  });

  it('flags a record created before the time zone was known', () => {
    expect(needsReschedule({cronTime: DAILY_REMINDER_CRON}, wanted)).toBe(true);
    expect(needsReschedule({cronTime: DAILY_REMINDER_CRON, timeZone: 'UTC'}, wanted)).toBe(true);
  });

  it('leaves an already-correct record alone', () => {
    expect(needsReschedule({cronTime: DAILY_REMINDER_CRON, timeZone: 'Europe/Moscow'}, wanted)).toBe(false);
  });

  it('treats a missing stored zone as UTC rather than a mismatch', () => {
    expect(needsReschedule({cronTime: DAILY_REMINDER_CRON}, getReminderSchedule(undefined))).toBe(false);
  });
});
