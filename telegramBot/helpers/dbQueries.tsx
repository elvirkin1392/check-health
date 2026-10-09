import {DateTime as dt} from "luxon";
import {UpdateFilter} from "mongodb";
import {Command} from "../enums/Command";
import {IllPeriod, UserDoc} from "../../db/templates/UserTemplate.tsx";

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
  }
  return undefined;
}

export const getColdStartQuery = (user: UserDoc, _command: string, data: IllPeriod): UserUpdate | UserUpdate[] | undefined => {
  const periods = user.ill_periods;
  const lastPeriod = periods?.[periods.length - 1];

  if (lastPeriod && !lastPeriod.end_date) {
    const diffDays = dt
      .now()
      .diff(dt.fromISO(lastPeriod.start_date), ['days', 'hours'])
      .toObject().days
      || 1;

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