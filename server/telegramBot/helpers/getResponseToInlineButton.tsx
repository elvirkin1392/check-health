import {DateTime as dt} from "luxon";
import {getMessageTemplate, decodeCalendarTarget} from "./getMessageTemplate";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";
import {translate, resolveLang, Lang} from "../i18n/index.tsx";
import {getReminderSchedule, isValidTimeZone} from "./reminderSchedule";

type Response = {
  closeSession?: { text: string, reply_markup?: any },
  updateData?: any,
  jobConfig?: any,
  // Set when the change invalidates the schedule of an already-running job.
  rescheduleJobs?: boolean,
}

export const getResponseToInlineButton = (commandKey: string, value?: any, lang: Lang = 'en', timeZone?: string): Response => {
  switch (commandKey) {
    case MessageType.Calendar: {
      const {t, y, m} = value;
      return {closeSession: getMessageTemplate(MessageType.Calendar, {target: decodeCalendarTarget(t), year: y, month: m, lang})};
    }
    case Command.Lang: {
      const newLang = resolveLang(value);
      return {
        closeSession: {text: translate('lang_saved', newLang)},
        updateData: {lang: newLang}
      };
    }
    case Command.TimeZone: {
      if (!isValidTimeZone(value)) {
        return {closeSession: {text: translate('timezone_invalid', lang)}};
      }
      return {
        closeSession: {text: translate('timezone_saved', lang, {value})},
        updateData: {timeZone: value},
        rescheduleJobs: true
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
          ...getReminderSchedule(timeZone),
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
