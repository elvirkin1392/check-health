import {CronJob} from 'cron';

import {sendMessage} from "../telegramBot/telegram.api";
import {db} from "../db/dbClient";

type StopConfig = {shouldStop: true, userId: string, type: string};
type StartConfig = {shouldStop?: false, userId: string, type: string, messageTemplate: any, cronTime: string};

export const toggleJob = async (config: StopConfig | StartConfig) => {
  if (config.shouldStop === true) {
    await stopJob(config);
  } else {
    await startJob(config);
  }
}

type ScheduledJob = {jobIdDb: number, userId: string, messageTemplate: any, cronTime: string};

const scheduleJob = ({jobIdDb, userId, messageTemplate, cronTime}: ScheduledJob) => {
  const job = CronJob.from({
    cronTime,
    onTick: async function () {
      const tgJobs = db.collection('tgJobs');
      const isListed = await tgJobs.findOne({jobIdDb});

      if (isListed) {
        await sendMessage(userId, messageTemplate);
      } else {
        this.stop();
      }
    }
  });
  job.start();
}

export const startJob = async (config: { userId: string, type: string, messageTemplate: any, cronTime: string }): Promise<number | undefined> => {
  const {
    type,
    userId,
    messageTemplate,
    cronTime
  } = config;

  const tgJobs = db.collection('tgJobs');
  const isJobRunning = await tgJobs.findOne({"userId": userId, "type": type});

  if (isJobRunning) {
    return undefined;
  }

  const jobIdDb = Date.now();
  await tgJobs.insertOne({jobIdDb, userId, messageTemplate: JSON.stringify(messageTemplate), cronTime, type});
  scheduleJob({jobIdDb, userId, messageTemplate, cronTime});

  return jobIdDb;
}
export const stopJob = async ({userId, type}: {userId: string, type: string}) => {
  const tgJobs = db.collection('tgJobs');
  await tgJobs.deleteOne({"userId": userId, "type": type});
}

// Re-schedules jobs that were persisted in tgJobs but lost their
// in-memory CronJob when the process restarted (e.g. on every deploy).
export const restoreJobs = async () => {
  const tgJobs = db.collection('tgJobs');
  const jobs = await tgJobs.find({}).toArray();

  for (const job of jobs) {
    scheduleJob({
      jobIdDb: job.jobIdDb,
      userId: job.userId,
      messageTemplate: JSON.parse(job.messageTemplate),
      cronTime: job.cronTime,
    });
  }
}
