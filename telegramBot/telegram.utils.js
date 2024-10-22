import {commandsEnum} from './telegram.enums.js';

export const getCommand = (command, value) => {
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
                  date: new Date()
                })
              },
              {
                text: 'yesterday',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  date: new Date(new Date().setDate(new Date().getDate() - 1))
                })
              },
              {
                text: 'another date',
                callback_data: JSON.stringify({
                  command: commandsEnum.cold_start.commandKey,
                  date: null
                })
              }

            ]
          ],
          one_time_keyboard: true
        }
      }
    }
  }

}

