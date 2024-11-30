import {DateTime as dt} from "luxon";
import {commandsEnum, messageType} from '../telegram.enums.js';
import {getMessageTemplate} from "./getMessageTemplate";

export const getResponseToInlineButton = (commandKey: string, value?: string): any=> {
  switch (commandKey) {
    case commandsEnum.cold_start.commandKey: {
      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }
      if (dt.fromISO(value) > dt.now()) {
        throw new Error("date can't be older than today");
      }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {start_date: value, end_date: null}
      };
    }
    case commandsEnum.cold_end.commandKey: {
      //TODO validation, if start_date is today, then end_date can't be earlier
      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }
      if (dt.fromISO(value) > dt.now()) {
        throw new Error("date can't be older than today");
      }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData: {end_date: value}
      };
    }

    default: {
      return {}
    }

  }
}
