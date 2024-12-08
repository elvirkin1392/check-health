import {DateTime as dt} from "luxon";
import {CreateStatus} from "../enums/Statuses.tsx";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";

export const getMessageTemplate = (command: string, value?: string) => {
  const commandKey = command.replace('/', '');
  return MessageTemplates[commandKey](value);
}

const MessageTemplates = {
  [Command.Start]: (value) => {
    return value === CreateStatus.Failed
      ? { text: "Sorry but I couldn't create your profile. \nType 'bug_rescue' to get help from the beloved developer"}
      : { text: `Nice to meet you!\nI'm here to help you make some statistic about your health`}},
  [Command.Login]: (value) => {
    return {text: `You've been healthy for ${value} day(s)`}},
  [Command.HealthyDays]: (value) => {
    return { text: `You've been healthy for ${value} day(s)`}},
  [Command.HealthyYear]: (value) => {
    return {text: `You've been healthy for ${value} day(s) during the last year`}},
  [Command.ColdStart]: () => {
    return {
      text: 'How long does the flu last?',
      reply_markup: {
        inline_keyboard: [
          [{text: 'first day',
              callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now()
              })},
            {text: 'from yesterday', callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now().minus({day: 1})
              })}]
        ],
        one_time_keyboard: true
      }
    }},
  [Command.ColdEnd]: () => {
    return {
      text: 'When did you start feel well?',
      reply_markup: { //todo use calendar
        inline_keyboard: [
          [
            {text: 'today',
              callback_data: JSON.stringify({
                command: Command.ColdEnd,
                value: dt.now()
              })}
          ]
        ],
        one_time_keyboard: true
      }
    }},
  [MessageType.CheckHealth]: () => {
    return {
      text: 'How do you feel today?',
      reply_markup: {
        inline_keyboard: [
          [
            {text: "good",
              callback_data: JSON.stringify({
                query: MessageType.CheckHealth,
                value: true
              })},
            {text: 'still bad',
              callback_data: JSON.stringify({
                query: MessageType.CheckHealth,
                value: false
              })},
          ]
        ],
        one_time_keyboard: true
      }
    }},
  [MessageType.Calendar]: () => {
    return {text: 'Choose date'}}
 }