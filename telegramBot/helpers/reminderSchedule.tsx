import {IANAZone} from "luxon";

// Telegram updates carry no time zone: `message.date` is a bare Unix epoch and
// `from` only has `language_code`. A user who never opens the Mini App and never
// runs /timezone therefore has no zone stored, and constitution §9 requires the
// fallback to be explicit — that user is reminded at 12:00 UTC.
export const DEFAULT_TIME_ZONE = 'UTC';

// Daily at 12:00 in the user's own zone. Six fields: the leading one is seconds,
// so a missing leading field would silently mean "every minute at second N".
export const DAILY_REMINDER_CRON = '0 0 12 * * *';

// Offered by /timezone. Kept short and curated: every label is derived from the
// zone name, so adding a zone needs no new translation (§12).
export const TIME_ZONE_OPTIONS: string[] = [
  'Europe/London',
  'Europe/Berlin',
  'Europe/Kyiv',
  'Europe/Moscow',
  'Asia/Tbilisi',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  DEFAULT_TIME_ZONE,
];

export type ReminderSchedule = {cronTime: string, timeZone: string};

export const isValidTimeZone = (value?: string | null): boolean =>
  Boolean(value) && IANAZone.isValidZone(value);

export const resolveTimeZone = (value?: string | null): string =>
  isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;

export const getReminderSchedule = (userTimeZone?: string | null): ReminderSchedule => ({
  cronTime: DAILY_REMINDER_CRON,
  timeZone: resolveTimeZone(userTimeZone),
});

// A tgJobs record keeps the schedule it was created with, and the process
// re-reads it on every start (§5). Records written before the daily schedule
// existed, or before the user picked a zone, must be corrected on restore
// rather than restored as-is.
export const needsReschedule = (
  stored: {cronTime?: string, timeZone?: string},
  wanted: ReminderSchedule
): boolean =>
  stored.cronTime !== wanted.cronTime || resolveTimeZone(stored.timeZone) !== wanted.timeZone;
