import {CronJob} from 'cron';

import {sendMessage} from "../telegramBot/telegram.api.tsx";
import {getDbUserTimeZone} from "../telegramBot/telegram.db.tsx";
import {getReminderSchedule, needsReschedule} from "../telegramBot/helpers/reminderSchedule";
import {db} from "../db/dbClient.tsx";

type StopConfig = {shouldStop: true, userId: number, type: string};
type StartConfig = {shouldStop?: false, userId: number, type: string, messageTemplate: any, cronTime: string, timeZone: string};

export const toggleJob = async (config: StopConfig | StartConfig) => {
  if (config.shouldStop === true) {
    await stopJob(config);
  } else {
    await startJob(config);
  }
}

type ScheduledJob = {jobIdDb: number, userId: number, messageTemplate: any, cronTime: string, timeZone: string};

// What a tgJobs document holds. `cronTime` and `timeZone` are optional because
// records written before those fields existed are still in the collection (§8).
type TgJobDoc = {
  jobIdDb: number,
  userId: number,
  type: string,
  messageTemplate: string,
  cronTime?: string,
  timeZone?: string,
};

// The tgJobs record is the source of truth (§5); this map is only a process-local
// handle on the timers it describes, so a schedule change can take effect without
// waiting for the next restart. It is rebuilt from the database by restoreJobs.
const runningJobs = new Map<number, CronJob>();

const scheduleJob = ({jobIdDb, userId, messageTemplate, cronTime, timeZone}: ScheduledJob) => {
  // Replacing a job means dropping the timer it used to have, or the user would
  // be reminded on both the old and the new schedule.
  runningJobs.get(jobIdDb)?.stop();

  const job = CronJob.from({
    cronTime,
    timeZone,
    onTick: async function () {
      const tgJobs = db.collection<TgJobDoc>('tgJobs');
      const isListed = await tgJobs.findOne({jobIdDb});

      if (isListed) {
        await sendMessage(userId, messageTemplate);
      } else {
        this.stop();
        runningJobs.delete(jobIdDb);
      }
    }
  });
  job.start();
  runningJobs.set(jobIdDb, job);
}

export const startJob = async (config: { userId: number, type: string, messageTemplate: any, cronTime: string, timeZone: string }): Promise<number | undefined> => {
  const {
    type,
    userId,
    messageTemplate,
    cronTime,
    timeZone
  } = config;

  const tgJobs = db.collection<TgJobDoc>('tgJobs');
  const isJobRunning = await tgJobs.findOne({"userId": userId, "type": type});

  if (isJobRunning) {
    return undefined;
  }

  const jobIdDb = Date.now();
  await tgJobs.insertOne({jobIdDb, userId, messageTemplate: JSON.stringify(messageTemplate), cronTime, timeZone, type});
  scheduleJob({jobIdDb, userId, messageTemplate, cronTime, timeZone});

  return jobIdDb;
}
export const stopJob = async ({userId, type}: {userId: number, type: string}) => {
  const tgJobs = db.collection<TgJobDoc>('tgJobs');
  const stored = await tgJobs.findOne({"userId": userId, "type": type});
  await tgJobs.deleteOne({"userId": userId, "type": type});

  if (stored) {
    runningJobs.get(stored.jobIdDb)?.stop();
    runningJobs.delete(stored.jobIdDb);
  }
}

// Re-schedules jobs that were persisted in tgJobs but lost their
// in-memory CronJob when the process restarted (e.g. on every deploy).
// A record keeps whatever schedule it was created with, so one written before
// the daily schedule existed — or before its owner had a time zone — is
// corrected in the database here instead of being restored as-is.
export const restoreJobs = async () => {
  const tgJobs = db.collection<TgJobDoc>('tgJobs');
  const jobs = await tgJobs.find({}).toArray();

  for (const job of jobs) {
    try {
      const wanted = getReminderSchedule(await getDbUserTimeZone(job.userId));

      if (needsReschedule(job, wanted)) {
        console.log(`Correcting schedule of tgJobs record ${job.jobIdDb}: ${job.cronTime || 'none'} -> ${wanted.cronTime} in ${wanted.timeZone}`);
        await tgJobs.updateOne({jobIdDb: job.jobIdDb}, {$set: wanted});
      }

      scheduleJob({
        jobIdDb: job.jobIdDb,
        userId: job.userId,
        messageTemplate: JSON.parse(job.messageTemplate),
        ...wanted,
      });
    } catch (error) {
      console.error(`Failed to restore job ${job.jobIdDb}`, error);
    }
  }
}

// Called when a user picks a new time zone: their running reminders are now on
// the wrong schedule, and waiting for the next deploy to fix that would mean
// days of reminders at the old hour.
export const rescheduleUserJobs = async (userId: number, timeZone?: string) => {
  const tgJobs = db.collection<TgJobDoc>('tgJobs');
  const jobs = await tgJobs.find({"userId": userId}).toArray();
  const wanted = getReminderSchedule(timeZone);

  for (const job of jobs) {
    try {
      if (!needsReschedule(job, wanted)) {
        continue;
      }

      await tgJobs.updateOne({jobIdDb: job.jobIdDb}, {$set: wanted});
      scheduleJob({
        jobIdDb: job.jobIdDb,
        userId: job.userId,
        messageTemplate: JSON.parse(job.messageTemplate),
        ...wanted,
      });
    } catch (error) {
      console.error(`Failed to reschedule job ${job.jobIdDb}`, error);
    }
  }
}
