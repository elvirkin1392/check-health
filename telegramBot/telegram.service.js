import {getMessageTemplate, getResponseToCommand} from "./telegram.utils.js";
import {commandsEnum} from './telegram.enums.js';
import {sendMessage} from "./telegram.api.js";
import {updateDbData} from "../db/general.db.js";

const sendCommandResponse = (user, command, value) => {
  const options = getMessageTemplate(command, value);
  return sendMessage(user.id, options);
}

const addTGUpdates = async (payload) => {
  if (!payload || !payload.update_id) {
    return;
  }

  //user select bot_command
  if (payload.message?.entities && payload.message.entities[0].type === 'bot_command') {
    //todo message.entities is an array, need to check all of them

    //todo sendCommandResponse get info from db
    const response = await sendCommandResponse(payload.message.from, payload.message.text);

    return response;
  }

  //user response to bot_command
  if (payload.callback_query) {
    const user = payload.callback_query.from;
    const callbackData = JSON.parse(payload.callback_query.data); //button data we have sent with command
    const nextMove = getResponseToCommand(callbackData.command, callbackData.value);
    let response;

    if (nextMove.updateData) {
       response = await updateDbData({
        user,
        command: callbackData.command,
        data: nextMove.updateData
      });
    }

    if (nextMove.closeSession) {
      await sendMessage(user.id, nextMove.closeSession);
    }
    return response;
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