import {instance as axios} from "../axios";

const applyLoginResult = (message: {accessToken?: string, bio?: {username: string}}) => {
  if (message.accessToken && message.bio) {
    localStorage.setItem('accessToken', message.accessToken);
    localStorage.setItem('username', message.bio.username);

    return {isCodeVerified: true};
  }

  return {isCodeVerified: false};
}

export const loginRequest = async (data: {username: string}) => {
  const response = await axios.post('/api/auth', data);
  const message = response.data;

  return {isCodeSent: message.status === 200, url: message.url}
}

export const codeVerification = async (data: {username: string, code: string}) => {
  const response = await axios.post('/api/codeVerification', data);
  return applyLoginResult(response.data);
}

export const telegramLogin = async (initData: string) => {
  // The bot cannot learn the zone from Telegram updates, so the Mini App is the
  // one place that knows it. Sent on every login so a move is picked up.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await axios.post('/api/telegramAuth', {initData, timeZone});
  return applyLoginResult(response.data);
}