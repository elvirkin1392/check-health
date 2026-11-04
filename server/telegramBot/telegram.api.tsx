import axios from "axios";

const TG_TOKEN = process.env.CHECK_HEALTH_TELEGRAM_BOT_TOKEN;
const tgAxios = axios.create({baseURL: `https://api.telegram.org/bot${TG_TOKEN}`});

tgAxios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  console.error(error.message);
  return Promise.reject(error);
})

// What getMessageTemplate builds: the text plus an optional inline keyboard.
export type MessageOptions = {text: string, reply_markup?: unknown};

export const sendMessage = (id: number, options: MessageOptions) => {
  return tgAxios.post(`/sendMessage`, {chat_id: id, ...options}).then(response => response.data);
}

export const setWebhook = () => {
  return tgAxios.post(`/setWebhook`, {
    url: 'https://check-health-417373288113.europe-north1.run.app/api/listenWebHook',
    secret_token: process.env.CHECK_HEALTH_TELEGRAM_WEBHOOK_SECRET
  }).then(response => response.data);
}

export const unsetWebhook = () => {
  return tgAxios.post(`/setWebhook`, {
    url: ''
  }).then(response => response.data);
}


// Скачивание файла, присланного человеком: сначала getFile даёт `file_path`,
// потом по нему качается содержимое с отдельного хоста `/file/bot<TOKEN>/`.
//
// §14: ни `file_path`, ни имя файла в логи не попадают. У скачивания свой клиент
// без перехватчика `tgAxios`, а ошибка пересоздаётся с собственным текстом: в
// исходной ошибке axios лежит `config` с URL, где путь файла и токен бота, и
// отдавать её наружу незачем — кто-нибудь залогирует её целиком.
const fileAxios = axios.create({
  baseURL: `https://api.telegram.org/file/bot${TG_TOKEN}`,
  responseType: 'arraybuffer',
});

export const downloadFile = async (fileId: string): Promise<Uint8Array> => {
  const info = await tgAxios.post(`/getFile`, {file_id: fileId}).then(response => response.data);
  const filePath: unknown = info?.result?.file_path;

  // Telegram ответил 200, но пути нет (например, файл больше 20 МБ): это отказ,
  // а не пустой файл (§11). Сам ответ в ошибку не кладём.
  if (info?.ok !== true || typeof filePath !== 'string' || filePath === '') {
    throw new Error('Telegram getFile returned no file_path');
  }

  try {
    const response = await fileAxios.get<ArrayBuffer>(`/${filePath}`);

    return new Uint8Array(response.data);
  } catch (error) {
    // Сообщение и код без адреса и без тела ответа: в них могут быть путь к файлу и токен.
    const status = (error as {response?: {status?: number}}).response?.status;
    console.error(`Telegram file download failed${status ? `: ${status}` : ''}`);
    throw new Error(`Telegram file download failed${status ? `: ${status}` : ''}`);
  }
}
