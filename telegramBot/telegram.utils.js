import {commandsEnum} from './telegram.enums.js';

export const getCommand = (command) => {
  const commandKey = command.replace('/', '');

  switch (commandKey) {
    case commandsEnum.login.commandKey: {
      return {
        text: 'Do you want to login?',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'yes',
                callback_data: JSON.stringify({
                  command: commandsEnum.login.commandKey,
                  isReadyToLogin: true
                })
              },
              {
                text: 'no',
                callback_data: JSON.stringify({
                  command: commandsEnum.login.commandKey,
                  isReadyToLogin: false
                })
              }]
          ],
          one_time_keyboard: true
        }
      }
    }
    case commandsEnum.cold_start.commandKey: {
      return {
        text: 'How long does the flu last? Start from 1(today)',
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

