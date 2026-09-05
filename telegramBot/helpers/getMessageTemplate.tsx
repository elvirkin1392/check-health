import {DateTime as dt} from "luxon";
import {CreateStatus} from "../enums/Statuses.tsx";
import {Command} from "../enums/Command";
import {MessageType} from "../enums/MessageType";
import {translate, Lang} from "../i18n/index.tsx";

export const getMessageTemplate = (command: string, params?: any) => {
  const commandKey = command.replace('/', '');
  const template = MessageTemplates[commandKey];
  return template ? template(params) : undefined;
}

// 2024-01-01 is a Monday — used as a locale-aware source for weekday abbreviations.
const getWeekdayLabels = (lang: Lang) => {
  const monday = dt.fromObject({year: 2024, month: 1, day: 1}).setLocale(lang);
  return Array.from({length: 7}, (_, i) => monday.plus({days: i}).toFormat('ccc'));
}

type CalendarParams = {target: string, year: number, month: number, lang: Lang};

const navButton = (text: string, {target, year, month}: Omit<CalendarParams, 'lang'>) => ({
  text,
  callback_data: JSON.stringify({command: MessageType.Calendar, value: {target, year, month}})
});

const buildCalendar = ({target, year, month, lang}: CalendarParams) => {
  const first = dt.fromObject({year, month, day: 1}).setLocale(lang);
  const today = dt.now().startOf('day');
  const prev = month === 1 ? {target, year: year - 1, month: 12} : {target, year, month: month - 1};
  const next = month === 12 ? {target, year: year + 1, month: 1} : {target, year, month: month + 1};

  const rows: any[] = [
    [navButton('«', prev), navButton(first.toFormat('LLLL yyyy'), {target, year, month}), navButton('»', next)],
    getWeekdayLabels(lang).map((label) => navButton(label, {target, year, month}))
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

  return {text: translate('choose_a_date', lang), reply_markup: {inline_keyboard: rows}};
}

const MessageTemplates = {
  [Command.Start]: ({status, lang}) => {
    return {text: translate(status === CreateStatus.Failed ? 'start_failed' : 'start_created', lang)}},
  [Command.HealthyDays]: ({value, lang}) => {
    return {text: value === undefined ? translate('healthy_days_none', lang) : translate('healthy_days', lang, {value})}},
  [Command.HealthyYear]: ({value, lang}) => {
    return {text: translate('healthy_year', lang, {value})}},
  [Command.Login]: ({value, lang}) => {
    return {text: translate('login_code', lang, {value})}},
  [Command.Lang]: ({lang}) => {
    return {
      text: translate('lang_prompt', lang),
      reply_markup: {
        inline_keyboard: [[
          {text: 'English', callback_data: JSON.stringify({command: Command.Lang, value: 'en'})},
          {text: 'Русский', callback_data: JSON.stringify({command: Command.Lang, value: 'ru'})}
        ]],
        one_time_keyboard: true
      }
    }},
  [Command.ColdStart]: ({lang}) => {
    return {
      text: translate('cold_start_question', lang),
      reply_markup: {
        inline_keyboard: [
          [{text: translate('cold_start_first_day', lang),
              callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now().toISODate()
              })},
            {text: translate('cold_start_yesterday', lang), callback_data: JSON.stringify({
                command: Command.ColdStart,
                value: dt.now().minus({day: 1}).toISODate()
              })}],
          [navButton(translate('pick_a_date', lang), {target: Command.ColdStart, year: dt.now().year, month: dt.now().month})]
        ],
        one_time_keyboard: true
      }
    }},
  [Command.ColdEnd]: ({lang}) => {
    return {
      text: translate('cold_end_question', lang),
      reply_markup: {
        inline_keyboard: [
          [
            {text: translate('cold_end_today', lang),
              callback_data: JSON.stringify({
                command: Command.ColdEnd,
                value: dt.now().toISODate()
              })}
          ],
          [navButton(translate('pick_a_date', lang), {target: Command.ColdEnd, year: dt.now().year, month: dt.now().month})]
        ],
        one_time_keyboard: true
      }
    }},
  [MessageType.CheckHealth]: ({lang}) => {
    return {
      text: translate('check_health_question', lang),
      reply_markup: {
        inline_keyboard: [
          [
            {text: translate('check_health_good', lang),
              callback_data: JSON.stringify({
                command: MessageType.CheckHealth,
                value: true
              })},
            {text: translate('check_health_still_bad', lang),
              callback_data: JSON.stringify({
                command: MessageType.CheckHealth,
                value: false
              })},
          ]
        ],
        one_time_keyboard: true
      }
    }},
  [MessageType.Calendar]: (params: CalendarParams) => buildCalendar(params)
 }
