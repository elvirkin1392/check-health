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
  const response = await axios.post('/api/telegramAuth', {initData});
  return applyLoginResult(response.data);
}