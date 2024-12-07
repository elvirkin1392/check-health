import {CronJob} from 'cron';
import {DateTime as dt} from "luxon";

import {sendMessage} from "../telegramBot/telegram.api";
import {db} from "../db/dbClient";

//TODO add restart jobs functionality
export const toggleJob = async ({shouldStop, ...config}) => {
  if (shouldStop) {
    await stopJob(config)
  } else {
    const jobIdDb = await startJob(config);
  }
}

export const startJob = async (config: { userId: string, messageTemplate: any, cronTime: string }) => {
  const {
    type,
    userId,
    messageTemplate,
    cronTime
  } = config;

  const tgJobs = db.collection('tgJobs');
  const isJobRunning = await tgJobs.findOne({"userId": userId, "type": type});

  if (isJobRunning) {
    return;
  }

  const jobIdDb = Date.now();
  await tgJobs.insertOne({jobIdDb, userId, messageTemplate: JSON.stringify(messageTemplate), type});

  const job = CronJob.from({
    cronTime,
    onTick: async function () {
      const {userId, messageTemplate} = config;
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

  return jobIdDb;
}
export const stopJob = async ({userId, type}) => {
  const tgJobs = db.collection('tgJobs');
  await tgJobs.deleteOne({"userId": userId, "type": type});
}

type Job = {
  cronTime: string | Date | dt,
  onTick: () => void | Promise<void>,
  onComplete?: () => void | Promise<void>,
  start?: boolean | null,
  context?: any,
  runOnInit?: boolean | null,
  unrefTimeout?: boolean | null
}
