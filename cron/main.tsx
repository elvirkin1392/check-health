import {CronJob} from 'cron';

import {sendMessage} from "../telegramBot/telegram.api";
import {db} from "../db/dbClient";

type StopConfig = {shouldStop: true, userId: string, type: string};
type StartConfig = {shouldStop?: false, userId: string, type: string, messageTemplate: any, cronTime: string};

//TODO add restart jobs functionality
export const toggleJob = async (config: StopConfig | StartConfig) => {
  if (config.shouldStop === true) {
    await stopJob(config);
  } else {
    await startJob(config);
  }
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
export const stopJob = async ({userId, type}: {userId: string, type: string}) => {
  const tgJobs = db.collection('tgJobs');
  await tgJobs.deleteOne({"userId": userId, "type": type});
}
