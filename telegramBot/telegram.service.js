import {getCommand} from "./telegram.utils.js";
import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";

const sendCommandResponse = (user, command) => {
  const {chat_id: chatId} = user;
  const options = getCommand(command);

  return sendMessage(chatId, options);
}

const addTGUpdates = (payload) => {
  if (!payload || !payload.update_id) {
    return;
  }
  console.log('payload.update_id', payload.update_id);

  if (payload.entities && payload.entities.type === 'bot_command') {
    //todo check if payload.from has chat_id or id?
    const response = sendCommandResponse(payload.from, payload.text);
    return;
  }

  if (payload.message) {
    //TODO response to only commands
    console.log('payload.message', payload.message);

    const user = updateUser({
      userData: payload.message.from,
      message: payload.message.text
    });

    return;
  }


  if (payload.edited_message) {
    console.log('payload.edited_message', payload.edited_message);
    // const user = updateUser({
    //   userData: payload.edited_message.from,
    //   message: payload.edited_message.text
    // });

    return;
  }
}

const sendTGLoginMessage = (userId, generatedCode) => {
  const options = getCommand(commandsEnum.login.commandKey, generatedCode)

  return sendMessage(userId, options)
}

export {
  addTGUpdates,
  sendTGLoginMessage,
  sendCommandResponse
}