import {commandsEnum, messageType} from './telegram.enums.js';
import {DateTime as dt} from "luxon";

export const getMessageTemplate = (command, value) => {
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case commandsEnum.login.commandKey: {
      return {
        text: `Code for login to check-health app \n ${value}`
      }
    }
    case commandsEnum.healthy_days.commandKey: {
      return {
        text: `You've been healthy for ${value} day(s)`
      }
    }
    case commandsEnum.healthy_year.commandKey: {
      return {
        text: `You've been healthy for ${value} day(s) during the last year`
      }
    }
    case commandsEnum.cold_start.commandKey: {
      return {
        text: 'How long does the flu last?',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'first day',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  value: dt.now()
                })
              },
              {
                text: 'from yesterday',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  value: dt.now().minus({ day: 1 })
                })
              },
              {
                text: 'another date',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  value: null
                })
              }

            ]
          ],
          one_time_keyboard: true
        }
      }
    }
    case commandsEnum.cold_end.commandKey: {
      return {
        text: 'When did you start feel well?',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'today',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_end.commandKey,
                  value: dt.now()
                })
              },
              {
                text: 'yesterday',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_end.commandKey,
                  value: dt.now().minus({ day: 1 })
                })
              },
              {
                text: 'another date',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_end.commandKey,
                  value: null
                })
              }

            ]
          ],
          one_time_keyboard: true
        }
      }
    }
    case messageType.calendar.typeKey: {
      return {
        text: 'Choose date'
      }
    }
  }
}

export const getResponseToInlineButton = (commandKey, value) => {
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
        updateData:  {start_date: value, end_date: null}
      };
    }
    case commandsEnum.cold_end.commandKey: {
      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }
      if (dt.fromISO(value) > dt.now()) {
        throw new Error("date can't be older than today");
      }

      return {
        closeSession: {text: 'Calendar has been updated'},
        updateData:  {end_date: value}
      };
    }

    default: {
      return {}
    }

  }
}
