interface User {
  id: Number,
  first_name: String,
  last_name: String,
  username: String
}
interface Chat {
  id: Number,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title: String,
  username: String,
  first_name: String,
  last_name: String,
  all_members_are_administrators: Boolean
}
interface MessageEntity {
  type: 'mention'| 'hashtag'| 'bot_command'| 'url'| 'email'| 'bold'| 'italic'| 'code'| 'pre'| 'text_link',
  offset: Number,
  length: Number,
  url: String
}
interface Audio {}
interface Document {}
interface PhotoSize {}
interface Video {}
interface Voice {}
interface Contact {}
interface Location {}
interface Venue {}
interface Sticker {}
interface Message {
  message_id: Number,
  from: User,
  date: Number,
  chat: Chat,
  forward_from: User,
  forward_date: Number,
  reply_to_message: Message,
  text: String,
  entities: MessageEntity[],
  audio: Audio,
  document: Document,
  photo: PhotoSize[],
  sticker: Sticker, video: Video, voice: Voice, caption: String,
  contact: Contact, location: Location, venue: Venue,
  new_chat_member: User,
  left_chat_member:User,
  new_chat_title: String,
  new_chat_photo: PhotoSize[],
  delete_chat_photo: true,
  group_chat_created: true,
  supergroup_chat_created: true,
  channel_chat_created: true,
  migrate_to_chat_id: Number,
  migrate_from_chat_id: Number,
  pinned_message: Message
}


interface Update  {
  update_id: Number,
  message: Message, //optional
  inline_query: {}, //optional
  chosen_inline_result: {}, //optional
  callback_query: {} //optional
}