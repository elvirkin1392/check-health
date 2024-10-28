import {getMessageTemplate, responseToCommand} from "./telegram.utils.js";
import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";
import {updateDbData} from "../db/general.db.js";

const sendCommandResponse = (user, command) => {
  const {id: chatId} = user;
  const options = getMessageTemplate(command);

  return sendMessage(chatId, options);
}

const addTGUpdates = (payload) => {
  if (!payload || !payload.update_id) {
    return;
  }
  console.log('payload.update_id', payload.update_id);

  //user selected bot_command
  if (payload.entities && payload.entities.type === 'bot_command') {
    const response = sendCommandResponse(payload.from, payload.text);
    return;
  }

  //response to bot_command
  if (payload.callback_query) {
    const callbackData = JSON.parse(payload.callback_query.data);

    const nextMove = responseToCommand(callbackData.command, callbackData.value);

    if (nextMove.closeSession && nextMove.text) {
      const response = sendMessage(payload.from.chat_id, nextMove.text)
      return;
    }
    if (nextMove.updateData) {
      const response = updateDbData({
        user: callbackData.from,
        command: callbackData.command,
        data: nextMove.updateData
      })
    }

    return;
  }

  //user sent message text
  if (payload.message) {
    //TODO response to only commands
    console.log('payload.message', payload.message);

    // const user = updateUser({
    //   userData: payload.message.from,
    //   message: payload.message.text
    // });

    return;
  }

  //user edited/updated prev message
  if (payload.edited_message) {
    console.log('payload.edited_message', payload.edited_message);
    return;
  }
}

const sendTGLoginMessage = (userId, generatedCode) => {
  const options = getMessageTemplate(commandsEnum.login.commandKey, generatedCode)

  return sendMessage(userId, options)
}

export {
  addTGUpdates,
  sendTGLoginMessage,
  sendCommandResponse
}