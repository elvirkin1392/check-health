import axios from "axios";

const TG_TOKEN = process.env.CHECK_HEALTH_TELEGRAM_BOT_TOKEN;
const tgAxios = axios.create({baseURL: `https://api.telegram.org/bot${TG_TOKEN}`});

tgAxios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  console.error(error);
  return Promise.reject(error);
})

export const sendMessage = (chatId, options) => {
  return tgAxios.post(`/sendMessage`, {chat_id: chatId, ...options}).then(response => response.data);
}

export const setWebhook = () => {
  return tgAxios.post(`/setWebhook`, {
    url: 'https://check-health-417373288113.europe-north1.run.app/api/listenWebHook'
  }).then(response => response.data);
}

export const unsetWebhook = () => {
  return tgAxios.post(`/setWebhook`, {
    url: ''
  }).then(response => response.data);
}

export const getWebhookInfo = () => {
  return axios.get(`https://api.telegram.org/bot${TG_TOKEN}/getWebhookInfo`)
    .then((response) => {
      console.log('getWebhookInfo', response.data);
      return response.data;
    });
}