import generateToken from './token.utils.js'
import HttpException from '../../models/http-exception.model.js'
import {sendTGLoginMessage} from '../../telegramBot/telegram.service.js'
import {getUserBio, getUserLoginCode, updateUserLoginCode} from "./auth.db.js";

export const login = async (username) => {
  if (!username) {
    throw new HttpException(422, "username can't be blank");
  }

  const userData = await getUserBio(username);

  //TODO if there is no username, and we try to login. Open telegram bot link

  try {
    const generatedCode = `${Math.floor(Math.random() * 10000)}`.padStart(4,0);
    const result = await sendTGLoginMessage(userData.bio.id, generatedCode);
    const updatedUser = await updateUserLoginCode(userData._id, generatedCode);

    console.log('send message on tg bot', result.data);
    console.log('updatedUser', updatedUser);
    return {status: 200, text: 'Code sent to TG'};
  } catch (error) {
    console.log('Error login', error.message);
    return error;
  }
}

export const codeVerification = async (username, code) => {
  const result = await getUserLoginCode(username);

  if (result.loginCode === code) {
    const data = {
      bio: result.bio,
      accessToken: generateToken(result.bio.id),
    }

    //close login session
    await updateUserLoginCode(result.bio.id, '');
    return data;
  }

  return new Error('Wrong code');
}

