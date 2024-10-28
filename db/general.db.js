import {db} from "./dbClient.js";
import {commandsEnum} from "../telegramBot/telegram.enums.js";

export const updateDbData = async ({user, command, data}) => {
  const {chat_id: userId} = user;

  const users = db.collection('users');
  const query = getQuery(command, data);

  const result = await users.updateOne({_id: userId}, query );

  return result;
}

const getQuery = (command, data) => {
  switch (command) {
    case commandsEnum.cold_start.commandKey:
      return {$push: {'ill_periods': data}};
  }
}