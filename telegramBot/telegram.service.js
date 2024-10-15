import {updateUserLoginStatus} from '../routes/auth/auth.service.js'
import {users} from "../mock.js";
import {getCommand} from "./telegram.utils.js";
import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";

const sendCommandResponse = (user, command) => {
  const { chat_id: chatId, username } = user;

  // if (!users[username]) {
  //   return null;
  // }

  const options = getCommand(command);

  return sendMessage(chatId, options);
}

const addTGUpdates = (payload) => {
  console.log('inside addTGUpdates', payload, payload.update_id);

  if (!payload || !payload.update_id) {
    return;
  }
  console.log('payload.update_id', payload.update_id);

  if (payload.entities && payload.entities.type === 'bot_command') {
    sendCommandResponse(payload.from, payload.text);
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

  if (payload.callback_query) {
    //callback for login
    const callbackData = JSON.parse(payload.callback_query.data);
    if (callbackData.command === 'login' && callbackData.isReadyToLogin) {
      const user = updateUserLoginStatus({
        userData: payload.callback_query.from,
        isReadyToLogin: true
      });
      console.log('payload.callback_query', user)
    } else if (callbackData.command === 'login' && !callbackData.isReadyToLogin) {
      const user = updateUserLoginStatus({
        userData: payload.callback_query.from,
        isReadyToLogin: false
      });
      console.log('got user login status', user);
    }

    return
  }

  if (payload.edited_message) {
    console.log('payload.edited_message', payload.edited_message);
    const user = updateUser({
      userData: payload.edited_message.from,
      message: payload.edited_message.text
    });

    return;
  }
}

const sendTGLoginMessage = (username) => {
  if (!users[username]?.chat_id) {
    return false;
  }
  const chatID = users[username].chat_id
  const options = getCommand(commandsEnum.login.commandKey, chatID)
  return sendMessage(options)
}

export {
  addTGUpdates,
  sendTGLoginMessage,
  sendCommandResponse
}