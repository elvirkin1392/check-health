import {DateTime as dt} from "luxon";

import {sendMessage} from "./telegram.api.js";
import {updateDbData, getDbLastSickDay, getDbIllPeriods, getDbLastSickPeriod, createDbUser} from "./telegram.db.js";
import {
  calcPeriodBetweenDates,
  extractPeriodsFromYear,
  getResponseToInlineButton,
  getMessageTemplate,
  restructureUpdatesData
} from "./helpers/main";
import {Update, User} from "./telegram.types.js";
import {toggleJob} from "../cron/main.tsx";
import {Command} from "./enums/Command";

const manageTgUpdates = async (update: Update) => {
  const {messageType, userTg, message} = restructureUpdatesData(update);

  switch (messageType) {
    case 'bot_command': {
      await sendResponseToCommand(userTg, message);
      return;
    }
    case 'inline_button': {
      const {command, value} = JSON.parse(message);
      const nextMove = getResponseToInlineButton(command, value);

      if (nextMove.updateData) {
        await updateDbData({
          command,
          user: userTg,
          data: nextMove.updateData
        });
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

const sendResponseToCommand = async (userTg: User, command: string, payload?: any) => {
  let value = payload;
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case Command.Start: {
      const status = await createDbUser(userTg);
      value = status;
      break;
    }
    case Command.HealthyDays: {
      const lastSickDay = await getDbLastSickDay(userTg);
      value = calcPeriodBetweenDates(lastSickDay, dt.now()).days;
      break;
    }
    case Command.HealthyYear: {
      const periods = await getDbIllPeriods(userTg);
      value = extractPeriodsFromYear(periods);
      break;
    }
    case Command.ColdEnd: {
      const lastPeriod = await getDbLastSickPeriod(userTg);
      // value = get(lastPeriod); todo return last start date to calc available dates
      break;
    }
  }

  const options = getMessageTemplate(command, value);
  if (options) {
    await sendMessage(userTg.id, options);
  }
}

export {
  manageTgUpdates,
  sendResponseToCommand
}