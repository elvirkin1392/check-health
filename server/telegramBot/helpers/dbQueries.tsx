import {UpdateFilter} from "mongodb";
import {Command} from "../enums/Command";
import {IllPeriod, UserDoc} from "../../db/templates/UserTemplate.tsx";
import {calcPeriodBetweenDates} from "./formatData";

export type UserUpdate = UpdateFilter<UserDoc>;

export const getQuery = (user: UserDoc, command: string, data: any): UserUpdate | UserUpdate[] | undefined => {
  switch (command) {
    case Command.ColdStart: {
      return getColdStartQuery(user, command, data);
    }

    case Command.ColdEnd: {
      return getColdEndQuery(user, command, data);
    }

    case Command.Lang: {
      return {$set: {lang: data.lang}};
    }

    case Command.TimeZone: {
      return {$set: {timeZone: data.timeZone}};
    }
  }
  return undefined;
}

export const getColdStartQuery = (user: UserDoc, _command: string, data: IllPeriod): UserUpdate | UserUpdate[] | undefined => {
  const periods = user.ill_periods;
  const lastPeriod = periods?.[periods.length - 1];

  if (lastPeriod && !lastPeriod.end_date) {
    // Сколько дней между началом незакрытого периода и тем, что отмечают сейчас.
    // Здесь стоял `dt.now()` — серверное «сейчас» против сохранённой даты, то есть
    // ровно то, что §9 называет ошибкой. После фичи 002 рассогласование стало видным:
    // `start_date` — день пользователя, и у человека восточнее UTC разница уходила
    // в минус, новый период молча не создавался, а в ответ приходило «обновлено».
    // Обе даты календарные и обе выбраны пользователем — пояс для их сравнения не нужен.
    const diffDays = calcPeriodBetweenDates(lastPeriod.start_date, data.start_date).days || 1;

    if (diffDays > 1) {
      const closePrevPeriod = lastPeriod.start_date;
      const query = getColdEndQuery(user, Command.ColdEnd, {end_date: closePrevPeriod});

      return [{$push: {ill_periods: data}}, query]
    }
    return undefined;
  }
  return {$push: {ill_periods: data}};
}

export const getColdEndQuery = (user: UserDoc, _command: string, data: {end_date: string}): UserUpdate | undefined => {
  const periods = user.ill_periods;
  const lastPeriod = periods?.[periods.length - 1];

  if (lastPeriod && !lastPeriod.end_date) {
    const lastElement = periods.length - 1;
    const fieldName = "ill_periods." + lastElement + ".end_date";

    return {$set: {[fieldName]: data.end_date}};
  }
  return undefined;
}