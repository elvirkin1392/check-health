import { DateTime as dt } from "luxon";
import {getMessageTemplate, getResponseToInlineButton} from "./telegram.utils.js";
import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";
import {updateDbData, getDbLastSickDay, getDbIllPeriods} from "../db/general.db.js";

const sendResponseToCommand = async (user, command, payload) => {
  let value = payload;
  const commandKey = command.replace('/', '');

  if (commandKey === commandsEnum.healthy_days.commandKey) {
    const lastSickDay = await getDbLastSickDay(user);
    value = dt.now().diff(dt.fromISO(lastSickDay), ['days', 'hours']).toObject().days;
  }
  if (commandKey === commandsEnum.healthy_year.commandKey) {
    const periods = await getDbIllPeriods(user);
    const dayYearAgo = dt.now().minus({ year: 1 });
    value = 365;

    for (let i=periods.length-1; i >=0; i--) {
      const start = dt.fromISO(periods[i].start_date);
      const end = periods[i].end_date ? dt.fromISO(periods[i].end_date) : dt.now();
      if (start >= dayYearAgo && end >= dayYearAgo) {
        const diffDays = end.diff(start, ['days', 'hours']).toObject().days + 1;
        value = value - diffDays;
      }
      if (start < dayYearAgo && end >=dayYearAgo) {
        const diffDays = end.diff(dayYearAgo, ['days', 'hours']).toObject().days + 1;
        value = value - diffDays;
      }
    }
  }

  const options = getMessageTemplate(command, value);
  return await sendMessage(user.id, options);
}

const restructureUpdates = (data) => {
  if (data.message?.entities && data.message.entities[0].type === 'bot_command') {
    return {
      messageType: 'bot_command',
      user: data.message.from,
      message: data.message.text
    }
  }
  if (data.callback_query) {
    return {
      messageType: 'inline_button',
      user: data.callback_query.from,
      message: JSON.parse(data.callback_query.data)
    }
  }
  if (data.message) {
    return {
      messageType: 'message',
      user: data.from,
      message: data.message.text
    }
  }
}

const addTGUpdates = async (updates) => {
  const {messageType, user, message} = restructureUpdates(updates);
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

      if (nextMove.closeSession) {
        await sendMessage(user.id, nextMove.closeSession);
      }
      return;
    }
  }
}

export {
  addTGUpdates,
  sendResponseToCommand
}