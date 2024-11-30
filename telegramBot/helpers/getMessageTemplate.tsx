import {DateTime as dt} from "luxon";
import {commandsEnum, messageType} from '../telegram.enums.js';

export const getMessageTemplate = (command: string, value?: string) => {
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
    default: {
      return {}
    }
  }
}
