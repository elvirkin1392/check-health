import axios from 'axios';
import config from './config.tsx';

const instance = axios;
instance.defaults.baseURL = process.env.NODE_ENV === 'development' ? config.API_HOST_DEV : config.API_HOST;

export {instance}