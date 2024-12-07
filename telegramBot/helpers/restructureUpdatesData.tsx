import {Update, User} from "../telegram.types";
type Info = {
  messageType: string,
  userTg: User,
  message: string
}
export const restructureUpdatesData = (data: Update): Info => {
  if (data.message?.entities && data.message.entities[0].type === 'bot_command') {
    return {
      messageType: 'bot_command',
      userTg: data.message.from,
      message: data.message.text
    }
  }
  if (data.callback_query) {
    return {
      messageType: 'inline_button',
      userTg: data.callback_query.from,
      message: data.callback_query.data
    }
  }
  if (data.message) {
    return {
      messageType: 'message',
      userTg: data.message.from,
      message: data.message.text
    }
  }
}