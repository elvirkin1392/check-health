import axios from 'axios';
import config from './config.tsx';

const instance = axios;
instance.defaults.baseURL = process.env.NODE_ENV === 'development' ? config.API_HOST_DEV : config.API_HOST;

// Not Authorization: Yandex Cloud Serverless Containers take that header as an IAM
// token for the container itself and reject the request before it reaches the server.
// Read on every request, so login and logout apply without re-registering interceptors.
instance.interceptors.request.use(requestConfig => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    requestConfig.headers['X-Access-Token'] = accessToken;
  }
  return requestConfig;
});

export {instance}
