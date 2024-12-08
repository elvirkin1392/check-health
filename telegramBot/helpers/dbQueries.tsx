import {DateTime as dt} from "luxon";
import {Command} from "../enums/Command";

export const getQuery = (user, command, data) => {
  switch (command) {
    case Command.ColdStart: {
      return getColdStartQuery(user, command, data);
    }

    case Command.ColdEnd: {
      return getColdEndQuery(user, command, data);
    }
  }
}

export const getColdStartQuery = (user, command, data) => {
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
    return;
  }
  return {$push: {ill_periods: data}};
}

export const getColdEndQuery = (user, command, data) => {
  const periods = user.ill_periods;
  const lastPeriod = periods?.[periods.length - 1];

  if (lastPeriod && !lastPeriod.end_date) {
    const lastElement = periods.length - 1;
    const fieldName = "ill_periods." + lastElement + ".end_date";

    return {$set: {[fieldName]: data.end_date}};
  }

}