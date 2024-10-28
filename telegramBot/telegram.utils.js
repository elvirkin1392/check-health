import {commandsEnum, messageType} from './telegram.enums.js';

export const getMessageTemplate = (command, value) => {
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case commandsEnum.login.commandKey: {
      return {
        text: `Code for login to check-health app \n ${value}`
      }
    }
    case commandsEnum.cold_start.commandKey: {
      return {
        text: 'How long does the flu last?',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'today',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  value: new Date()
                })
              },
              {
                text: 'yesterday',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  value: new Date(new Date().setDate(new Date().getDate() - 1))
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
    case messageType.calendar.typeKey: {
      return {
        text: 'Choose date'
      }
    }
  }
}

export const responseToCommand = (commandKey, value) => {
  switch (commandKey) {
    case commandsEnum.cold_start.commandKey: {
      if (!value) {
        return getMessageTemplate(messageType.calendar.typeKey)
      }

      return {
        closeSession: true,
        text: 'Calendar has been updated',
        updateData:  {start_date: value, end_date: new Date()}
      };
    }
  }
}
