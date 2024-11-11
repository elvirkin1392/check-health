import {commandsEnum} from "../telegramBot/telegram.enums.js";

export const getColdStartQuery = (user, command, data) => {
  const periods = user.ill_periods;
  const lastPeriod = periods?.[periods.length - 1];

  if (lastPeriod && !lastPeriod.end_date) {
    if (lastPeriod.start_date - Date.now() > 7) {
      const closePrevPeriod = lastPeriod.start_date;
      const query = getColdEndQuery(user, commandsEnum.cold_end.commandKey, closePrevPeriod);

      return {$push: {ill_periods: data}, query}
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