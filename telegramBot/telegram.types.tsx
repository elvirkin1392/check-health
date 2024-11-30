export type User = {
  id: number,
  is_bot: boolean,
  first_name: string,
  last_name?: string,
  username?: string,
  language_code?: string,
  is_premium?: boolean,
  added_to_attachment_menu?: boolean,
  can_join_groups?: boolean,
  can_read_all_group_messages?: boolean,
  supports_inline_queries?: boolean,
  can_connect_to_business?: boolean,
  has_main_web_app?: boolean
}
export type Chat = {
  id: number,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title?: string,
  username?: string,
  first_name?: string,
  last_name?: string,
  all_members_are_administrators?: boolean
}
export type MessageEntity = {
  type: 'mention' | 'hashtag' | 'bot_command' | 'url' | 'email' | 'bold' | 'italic' | 'code' | 'pre' | 'text_link',
  offset: number,
  length: number,
  url?: string,
  language?: string,
  custom_emoji_id?: string
}
export type Audio = {}
export type Document = {}
export type PhotoSize = {}
export type Video = {}
export type Voice = {}
export type Contact = {}
export type Location = {}
export type Venue = {}
export type Sticker = {}
export type Message = {
  message_id: number,
  message_thread_id?: number,
  from: User,
  sender_chat?: Chat,
  sender_boost_count?: number,
  sender_business_bot?: User,
  date: number,
  business_connection_id?: string,
  chat: Chat,
  // forward_origin?: MessageOrigin,
  is_topic_message?:boolean,
  is_automatic_forward?:boolean,
  // forward_from: User,
  // forward_date: number,
  reply_to_message?: Message,
  // external_reply?: ExternalReplyInfo,
  // quote?: TextQuote,
  // reply_to_story?: Story,
  via_bot?: User,
  edit_date?:number,
  has_protected_content?: boolean,
  is_from_offline?:boolean,
  media_group_id?: string,
  author_signature?:string,
  text: string,
  entities?: MessageEntity[],
  // link_preview_options?: LinkPreviewOptions,
  effect_id?:string,
  animation?:Animation,
  audio?: Audio,
  document?: Document,
  // paid_media?: PaidMediaInfo,
  photo?: PhotoSize[],
  sticker?: Sticker, video?: Video, voice?: Voice, caption?: string,
  // story?: Story,
  // video_note?: VideoNote,
  caption_entities?: MessageEntity[],
  show_caption_above_media?: boolean,
  has_media_spoiler?: boolean,
  contact?: Contact,
  // dice?: Dice,
  location?: Location, venue?: Venue,
  // game?: Game,
  // poll?: Poll,
  new_chat_member?: User,
  left_chat_member?: User,
  new_chat_title?: string,
  new_chat_photo?: PhotoSize[],
  delete_chat_photo?: boolean,
  group_chat_created?: boolean,
  supergroup_chat_created?: boolean,
  channel_chat_created?: boolean,
  // message_auto_delete_timer_changed?:MessageAutoDeleteTimerChanged,
  // migrate_to_chat_id?: number,
  // migrate_from_chat_id?: number,
  // pinned_message?: MaybeInaccessibleMessage,
  // invoice?: Invoice,
  // successful_payment?: SuccessfulPayment,
  // refunded_payment?:RefundedPayment,
  // users_shared?:UsersShared,
  // chat_shared?:ChatShared,
  // connected_website?: string,
  // write_access_allowed?: WriteAccessAllowed,
  // passport_data?: PassportData,
  // boost_added?:	ChatBoostAdded,
  // chat_background_set?:ChatBackground,
  // reply_markup?:InlineKeyboardMarkup
}

export type InaccessibleMessage = {
  chat: Chat,
  message_id: number,
  date: number //Always 0. The field can be used to differentiate regular and inaccessible messages.
}
export type CallbackQuery = {
  id: string,
  from: User,
  message?: Message | InaccessibleMessage,
  inline_message_id?: string,
  chat_instance: string,
  data?: string,
  game_short_name?: string
}
export type InlineQuery = {
  id: string,
  from: User,
  query: string,
  offset: string,
  chat_type?: string,
  location?: Location
}
export type ChosenInlineResult = {
  result_id: string,
  from: User,
  location?: Location,
  inline_message_id?: string,
  query: string
}

export type Update = {
  update_id: number,
  message?: Message,
  edited_message?: Message,
  channel_post?: Message,
  edited_channel_post?: Message,
  business_message?: Message,
  edited_business_message?: Message,
  // business_connection?: BusinessConnection,
  // deleted_business_messages?: BusinessMessagesDeleted,
  // message_reaction?: MessageReactionUpdated,
  // message_reaction_count?: 	MessageReactionCountUpdated,
  inline_query?: 	InlineQuery,
  chosen_inline_result?: ChosenInlineResult,
  callback_query?: CallbackQuery,
  shipping_query?: ShippingQuery,
  // pre_checkout_query?:
  // purchased_paid_media?:
  // poll?:
  // poll_answer?:
  // my_chat_member?:
  // chat_member?:
  // chat_join_request?:
  // chat_boost?:
  // removed_chat_boost?:
}
export type ShippingAddress = {}
export type ShippingQuery = {
  id: string,
  from: User,
  invoice_payload: string,
  shipping_address: ShippingAddress
}