import {db} from "./dbClient.js";
import {commandsEnum} from "../telegramBot/telegram.enums.js";
import {getColdEndQuery, getColdStartQuery} from "./utils.js";

export const updateDbData = async ({user, command, data}) => {
  const {id: userId} = user;
  const users = db.collection('users');
  const currentUser = await users.findOne({"bio.id": userId})
  const query = getQuery(currentUser, command, data);

  if(!query) return {status: 'ok'};

  try {
    await users.updateOne({_id: currentUser._id}, query);
    return {status: 'ok'};
  } catch (e) {
    console.error(e);
    throw(e);
  }
}

export const getQuery = (user, command, data) => {
  switch (command) {
    case commandsEnum.cold_start.commandKey: {
      return getColdStartQuery(user, command, data);
    }

    case commandsEnum.cold_end.commandKey: {
      return getColdEndQuery(user, command, data);
    }
  }
}