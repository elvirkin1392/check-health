import {db} from "./dbClient.js";
import {commandsEnum} from "../telegramBot/telegram.enums.js";
import {getColdEndQuery, getColdStartQuery} from "./utils.js";

export const updateDbData = async ({user, command, data}) => {
  const {id: userId} = user;
  const users = db.collection('users');
  const currentUser = await users.findOne({"bio.id": userId})
  const query = getQuery(currentUser, command, data);

  try {
    return await users.updateOne({_id: currentUser._id}, query);
  } catch (e) {
    console.error(e);
    throw(e);
  }

}

export const getQuery = (user, command, data) => {
  switch (command) {
    case commandsEnum.cold_start.commandKey: {
      return getColdStartQuery(...arguments);
    }

    case commandsEnum.cold_end.commandKey: {
      return getColdEndQuery(...arguments);
    }
  }
}