import generateToken from './token.utils.js';
import HttpException from '../../models/http-exception.model.js';
import {sendResponseToCommand} from '../../telegramBot/telegram.service.tsx';
import {getUserBio, getUserLoginCode, updateUserLoginCode} from "./auth.db.js";
import {Command} from "../../telegramBot/enums/Command.tsx";

export const login = async (username) => {
  if (!username) {
    throw new HttpException(422, "username can't be blank");
  }

  const userData = await getUserBio(username);
  if (!userData) {
    return {url: 'https://telegram.me/c_health_bot'}
  }

  try {
    const generatedCode = `${Math.floor(Math.random() * 10000)}`.padStart(4, 0);
    await sendResponseToCommand(userData.bio, Command.Login, generatedCode);
    await updateUserLoginCode(userData._id, generatedCode);

    return {status: 200, text: 'Code sent to TG'};
  } catch (error) {
    return error;
  }
}

export const codeVerification = async (username, code) => {
  const result = await getUserLoginCode(username);

  if (result.loginCode === code) {
    const data = {
      bio: result.bio,
      accessToken: generateToken(result._id),
    }

    //close login session
    await updateUserLoginCode(result._id, '');
    return data;
  }

  return new Error('Wrong code');
}

