import {DateTime as dt} from "luxon";

import {sendMessage} from "./telegram.api.js";
import {updateDbData, getDbLastIllDay, getDbIllPeriods, getDbLastIllPeriod, getDbUserLang, getDbUserTimeZone, createDbUser} from "./telegram.db.tsx";
import {
  calcPeriodBetweenDates,
  extractPeriodsFromYear,
  getResponseToInlineButton,
  getMessageTemplate,
  restructureUpdatesData
} from "./helpers/main";
import {Update, User} from "./telegram.types.js";
import {toggleJob, rescheduleUserJobs} from "../cron/main.tsx";
import {Command} from "./enums/Command";

const manageTgUpdates = async (update: Update) => {
  const info = restructureUpdatesData(update);
  if (!info) {
    return;
  }
  const {messageType, userTg, message} = info;

  switch (messageType) {
    case 'bot_command': {
      await sendResponseToCommand(userTg, message);
      return;
    }
    case 'inline_button': {
      const {command, value} = JSON.parse(message);
      const lang = await getDbUserLang(userTg);
      const timeZone = await getDbUserTimeZone(userTg.id);
      const nextMove = getResponseToInlineButton(command, value, lang, timeZone);

      if (nextMove.updateData) {
        await updateDbData({
          command,
          user: userTg,
          data: nextMove.updateData
        });
      }
      // After the update, so the jobs are rebuilt from the zone just stored.
      if (nextMove.rescheduleJobs) {
        await rescheduleUserJobs(userTg.id, nextMove.updateData?.timeZone);
      }
      if (nextMove.jobConfig) {
        await toggleJob({userId: userTg.id, ...nextMove.jobConfig})
      }
      if (nextMove.closeSession) {
        await sendMessage(userTg.id, nextMove.closeSession);
      }
      return;
    }
  }
}

const sendResponseToCommand = async (userTg: User, command: string, value?: any) => {
  const lang = await getDbUserLang(userTg);
  let params:any = {value, lang};
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case Command.Start: {
      const status = await createDbUser(userTg);
      params = {status, lang};
      break;
    }
    case Command.HealthyDays: {
      const lastIllDay = await getDbLastIllDay(userTg);
      params.value = lastIllDay ? calcPeriodBetweenDates(lastIllDay, dt.now()).days : undefined;
      break;
    }
    case Command.HealthyYear: {
      const periods = await getDbIllPeriods(userTg);
      params.value = extractPeriodsFromYear(periods);
      break;
    }
    case Command.TimeZone: {
      params.value = await getDbUserTimeZone(userTg.id);
      break;
    }
    case Command.ColdEnd: {
      await getDbLastIllPeriod(userTg);
      // value = get(lastPeriod); todo return last start date to calc available dates
      break;
    }
  }

  const options = getMessageTemplate(command, params);
  if (options) {
    await sendMessage(userTg.id, options);
  }
}

export {
  manageTgUpdates,
  sendResponseToCommand
}
