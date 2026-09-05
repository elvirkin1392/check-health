import {instance as axios} from "../axios";

export const loginRequest = async (data: {username: string}) => {
  const response = await axios.post('/api/auth', data);
  const message = response.data;

  return {isCodeSent: message.status === 200, url: message.url}
}

export const codeVerification = async (data: {username: string, code: string}) => {
  const response = await axios.post('/api/codeVerification', data);

  const message = response.data;
  if (message.accessToken) {
    localStorage.setItem('accessToken', message.accessToken);
    localStorage.setItem('username', message.bio.username);

    return {isCodeVerified: true};
  }

  return {isCodeVerified: false};
}