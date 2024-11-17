import {instance as axios} from "../axios";

export const loginRequest = async ( data: Object) => {
  let response = await axios.post('/api/auth', data);
  let message = response.data;

  return {isCodeSent: message.status === 200}
}

export const codeVerification = async ( data: any) => {
  let response = await axios.post('/api/codeVerification', data);

  let message = response.data;
  if (message.accessToken) {
    localStorage.setItem('accessToken', message.accessToken);
    localStorage.setItem('username', message.username);
    axios.interceptors.request.use(config => {
      config.headers.Authorization = message.accessToken ? `Bearer ${message.accessToken}` : '';
      return config;
    });

    return {isCodeVerified: true};
  }

  return {isCodeVerified: false};
}