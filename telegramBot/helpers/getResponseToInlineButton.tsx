import {DateTime as dt} from "luxon";
import {getMessageTemplate} from "./getMessageTemplate";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";
import {translate, resolveLang, Lang} from "../i18n/index.tsx";

type Response = {
  closeSession?: { text: string, reply_markup?: any },
  updateData?: any,
  jobConfig?: any,
}

export const getResponseToInlineButton = (commandKey: string, value?: any, lang: Lang = 'en'): Response => {
  switch (commandKey) {
    case MessageType.Calendar: {
      return {closeSession: getMessageTemplate(MessageType.Calendar, {...value, lang})};
    }
    case Command.Lang: {
      const newLang = resolveLang(value);
      return {
        closeSession: {text: translate('lang_saved', newLang)},
        updateData: {lang: newLang}
      };
    }
    case Command.ColdStart: {
      if (!value) {
        return {closeSession: getMessageTemplate(MessageType.Calendar, {target: Command.ColdStart, year: dt.now().year, month: dt.now().month, lang})};
      }
      //todo move validation
      // if (dt.fromISO(value) > dt.now()) {
      //   throw new Error("date can't be older than today");
      // }

      return {
        closeSession: {text: translate('calendar_updated', lang)},
        updateData: {start_date: value, end_date: null},
        jobConfig: {
          cronTime: '10 * * * * *', //for testing every 10 sec todo change to every day
          messageTemplate: getMessageTemplate(MessageType.CheckHealth, {lang}),
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
        return {closeSession: getMessageTemplate(MessageType.Calendar, {target: Command.ColdEnd, year: dt.now().year, month: dt.now().month, lang})};
      }

      return {
        closeSession: {text: translate('calendar_updated', lang)},
        updateData: {end_date: value},
        jobConfig: {shouldStop: true, type: MessageType.CheckHealth}
      };
    }
    case MessageType.CheckHealth: {
      if(value) {
        return {
          closeSession: {text: translate('ill_period_closed', lang)},
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
