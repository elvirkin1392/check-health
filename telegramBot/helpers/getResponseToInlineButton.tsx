import {DateTime as dt} from "luxon";
import {commandsEnum, messageType} from '../telegram.enums.js';
import {getMessageTemplate} from "./getMessageTemplate";

type Response = {
  closeSession?: { text: string },
  updateData?: any,
  jobConfig?: any,
}

export const getResponseToInlineButton = (commandKey: string, value?: string): Response => {
  switch (commandKey) {
    case commandsEnum.cold_start.commandKey: {
      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }
      //todo move validation
      // if (dt.fromISO(value) > dt.now()) {
      //   throw new Error("date can't be older than today");
      // }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {start_date: value, end_date: null},
        jobConfig: {
          cronTime: '10 * * * * *',
          messageTemplate: getMessageTemplate(messageType.check_health.typeKey),
          type: messageType.check_health.typeKey
        }
      }
    }
    case commandsEnum.cold_end.commandKey: {
      //todo move validation
      // if (dt.fromISO(value) > dt.now()) {
      //   throw new Error("date can't be older than today");
      // }
      //TODO validation, if start_date is today, then end_date can't be earlier

      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {end_date: value},
        jobConfig: {shouldStop: true, type: messageType.check_health.typeKey}
      };
    }

    default: {
      return {}
    }

  }
}
