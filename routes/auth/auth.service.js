import generateToken from './token.utils.js';
import HttpException from '../../models/http-exception.model.js';
import {sendResponseToCommand} from '../../telegramBot/telegram.service.tsx';
import {getUserBio, getUserLoginCode, updateUserLoginCode, incrementLoginCodeAttempts, getOrCreateUserByTelegramId} from "./auth.db.js";
import {Command} from "../../telegramBot/enums/Command.tsx";
import {verifyTelegramInitData} from "./telegramInitData.util.tsx";

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

const MAX_LOGIN_CODE_ATTEMPTS = 5;

export const codeVerification = async (username, code) => {
  const result = await getUserLoginCode(username);

  if (!result || !result.loginCode) {
    return new Error('Wrong code');
  }

  if (result.loginCodeExpiresAt && Date.now() > result.loginCodeExpiresAt) {
    await updateUserLoginCode(result._id, '');
    return new Error('Code expired, request a new one');
  }

  if ((result.loginCodeAttempts || 0) >= MAX_LOGIN_CODE_ATTEMPTS) {
    await updateUserLoginCode(result._id, '');
    return new Error('Too many attempts, request a new code');
  }

  if (result.loginCode === code) {
    const data = {
      bio: result.bio,
      accessToken: generateToken(result._id),
    }

    //close login session
    await updateUserLoginCode(result._id, '');
    return data;
  }

  await incrementLoginCodeAttempts(result._id);
  return new Error('Wrong code');
}

export const loginWithTelegramWebApp = async (initData) => {
  const telegramUser = verifyTelegramInitData(initData, process.env.CHECK_HEALTH_TELEGRAM_BOT_TOKEN);
  if (!telegramUser) {
    throw new HttpException(401, "Invalid Telegram Web App data");
  }

  const user = await getOrCreateUserByTelegramId(telegramUser);

  return {
    bio: user.bio,
    accessToken: generateToken(user._id),
  }
}

