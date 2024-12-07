import {DateTime as dt} from "luxon";

import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";
import {updateDbData, getDbLastSickDay, getDbIllPeriods, getDbLastSickPeriod} from "./telegram.db.js";
import {
  calcPeriodBetweenDates,
  extractPeriodsFromYear,
  getResponseToInlineButton,
  getMessageTemplate,
  restructureUpdatesData
} from "./helpers/main";
import {Update, User} from "./telegram.types.js";
import {toggleJob} from "../cron/main.tsx";

const addTGUpdates = async (update: Update) => {
  const {messageType, user, message} = restructureUpdatesData(update);

  switch (messageType) {
    case 'bot_command': {
      await sendResponseToCommand(user, message);
      return;
    }
    case 'inline_button': {
      const nextMove = getResponseToInlineButton(message.command, message.value);

      if (nextMove.updateData) {
        await updateDbData({
          user,
          command: message.command,
          data: nextMove.updateData
        });
      }
      if (nextMove.jobConfig) {
        await toggleJob({ userId: user.id, ...nextMove.jobConfig})
      }
      if (nextMove.closeSession) {
        await sendMessage(user.id, nextMove.closeSession);
      }
      return;
    }
  }
}

const sendResponseToCommand = async (user: User, command: string, payload?: any) => {
  let value = payload;
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case commandsEnum.healthy_days.commandKey: {
      const lastSickDay = await getDbLastSickDay(user);
      value = calcPeriodBetweenDates(lastSickDay, dt.now()).days;
      break;
    }
    case commandsEnum.healthy_year.commandKey: {
      const periods = await getDbIllPeriods(user);
      value = extractPeriodsFromYear(periods);
      break;
    }
    case commandsEnum.cold_end.commandKey: {
      const lastPeriod = await getDbLastSickPeriod(user);
      // value = get(lastPeriod);
      break;
    }
  }

  const options = getMessageTemplate(command, value);
  return await sendMessage(user.id, options);
}

export {
  addTGUpdates,
  sendResponseToCommand
}