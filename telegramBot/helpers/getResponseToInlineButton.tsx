import {DateTime as dt} from "luxon";
import {getMessageTemplate} from "./getMessageTemplate";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";

type Response = {
  closeSession?: { text: string, reply_markup?: any },
  updateData?: any,
  jobConfig?: any,
}

export const getResponseToInlineButton = (commandKey: string, value?: any): Response => {
  switch (commandKey) {
    case MessageType.Calendar: {
      return {closeSession: getMessageTemplate(MessageType.Calendar, value)};
    }
    case Command.ColdStart: {
      if (!value) {
        return {closeSession: getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: dt.now().year, month: dt.now().month})};
      }
      //todo move validation
      // if (dt.fromISO(value) > dt.now()) {
      //   throw new Error("date can't be older than today");
      // }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {start_date: value, end_date: null},
        jobConfig: {
          cronTime: '10 * * * * *', //for testing every 10 sec todo change to every day
          messageTemplate: getMessageTemplate(MessageType.CheckHealth),
          type: MessageType.CheckHealth
        }
      }
    }
    case Command.ColdEnd: {
      //todo move validation
      // if (dt.fromISO(value) > dt.now()) {
      //   throw new Error("date can't be older than today");
      // }
      //TODO validation, if start_date is today, then end_date can't be earlier

      if (!value) {
        return {closeSession: getMessageTemplate(MessageType.Calendar, {target: Command.ColdEnd, year: dt.now().year, month: dt.now().month})};
      }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {end_date: value},
        jobConfig: {shouldStop: true, type: MessageType.CheckHealth}
      };
    }
    case MessageType.CheckHealth: {
      if(value) {
        return {
          closeSession: {text: 'Ill period was closed. Hooray!'},
          updateData: {end_date: value},
          jobConfig: {shouldStop: true, type: MessageType.CheckHealth}
        };
      }
      return {};
    }
    default: {
      return {}
    }

  }
}
