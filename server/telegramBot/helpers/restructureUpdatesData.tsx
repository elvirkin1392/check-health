import {Document, Update, User} from "../telegram.types";
type Info = {
  messageType: string,
  userTg: User,
  message: string,
  // Только у messageType 'document'.
  document?: Document
}
export const restructureUpdatesData = (data: Update): Info | undefined => {
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
  // Документ идёт раньше обычного сообщения: у него нет `text`, и без этой
  // ветки он попал бы в 'message' с пустым текстом и молча пропал.
  if (data.message?.document) {
    return {
      messageType: 'document',
      userTg: data.message.from,
      message: '',
      document: data.message.document
    }
  }
  if (data.message) {
    return {
      messageType: 'message',
      userTg: data.message.from,
      message: data.message.text
    }
  }
  return undefined;
}