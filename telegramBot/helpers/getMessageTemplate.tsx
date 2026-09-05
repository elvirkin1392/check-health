import {DateTime as dt} from "luxon";
import {CreateStatus} from "../enums/Statuses.tsx";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";

export const getMessageTemplate = (command: string, params?: any) => {
  const commandKey = command.replace('/', '');
  const template = MessageTemplates[commandKey];
  return template ? template(params) : undefined;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type CalendarParams = {target: string, year: number, month: number};

const navButton = (text: string, {target, year, month}: CalendarParams) => ({
  text,
  callback_data: JSON.stringify({command: MessageType.Calendar, value: {target, year, month}})
});

const buildCalendar = ({target, year, month}: CalendarParams) => {
  const first = dt.fromObject({year, month, day: 1});
  const today = dt.now().startOf('day');
  const prev = month === 1 ? {target, year: year - 1, month: 12} : {target, year, month: month - 1};
  const next = month === 12 ? {target, year: year + 1, month: 1} : {target, year, month: month + 1};

  const rows: any[] = [
    [navButton('«', prev), navButton(first.toFormat('LLLL yyyy'), {target, year, month}), navButton('»', next)],
    WEEKDAYS.map((label) => navButton(label, {target, year, month}))
  ];

  let week: any[] = new Array(first.weekday - 1).fill(navButton(' ', {target, year, month}));
  for (let day = 1; day <= first.daysInMonth; day++) {
    const date = dt.fromObject({year, month, day});
    week.push(
      date > today
        ? navButton('·', {target, year, month})
        : {text: String(day), callback_data: JSON.stringify({command: target, value: date.toISODate()})}
    );
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(navButton(' ', {target, year, month}));
    rows.push(week);
  }

  return {text: 'Choose a date', reply_markup: {inline_keyboard: rows}};
}

const MessageTemplates = {
  [Command.Start]: ({status}) => {
    return status === CreateStatus.Failed
      ? { text: "Sorry but I couldn't create your profile. \nType 'bug_rescue' to get help from the beloved developer"}
      : { text: `Nice to meet you!\nI'm here to help you make some statistic about your health`}},
  [Command.HealthyDays]: ({value}) => {
    return value === undefined
      ? {text: "You haven't logged any illness yet — you're doing great!"}
      : {text: `You've been healthy for ${value} day(s)`}},
  [Command.HealthyYear]: ({value}) => {
    return {text: `You've been healthy for ${value} day(s) during the last year`}},
  [Command.Login]: ({value}) => {
    return {text: `Your login code: ${value}`}},
  [Command.ColdStart]: () => {
    return {
      text: 'How long does the flu last?',
      reply_markup: {
        inline_keyboard: [
          [{text: 'first day',
              callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now().toISODate()
              })},
            {text: 'from yesterday', callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now().minus({day: 1}).toISODate()
              })}],
          [navButton('pick a date', {target: Command.ColdStart, year: dt.now().year, month: dt.now().month})]
        ],
        one_time_keyboard: true
      }
    }},
  [Command.ColdEnd]: () => {
    return {
      text: 'When did you start feel well?',
      reply_markup: {
        inline_keyboard: [
          [
            {text: 'today',
              callback_data: JSON.stringify({
                command: Command.ColdEnd,
                value: dt.now().toISODate()
              })}
          ],
          [navButton('pick a date', {target: Command.ColdEnd, year: dt.now().year, month: dt.now().month})]
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
  [MessageType.Calendar]: (params: CalendarParams) => buildCalendar(params)
 }
