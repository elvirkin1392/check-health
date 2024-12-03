import {Update} from "../telegram.types";

export const restructureUpdatesData = (data: Update) => {
  if (data.message?.entities && data.message.entities[0].type === 'bot_command') {
    return {
      messageType: 'bot_command',
      user: data.message.from,
      message: data.message.text
    }
  }
  if (data.callback_query) {
    return {
      messageType: 'inline_button',
      user: data.callback_query.from,
      message: JSON.parse(data.callback_query.data)
    }
  }
  if (data.message) {
    return {
      messageType: 'message',
      user: data.message.from,
      message: data.message.text
    }
  }
  return {};
}