import {Router, Request, Response} from 'express';

import auth from '../auth/auth.tsx';
import {manageTgUpdates} from '../../telegramBot/telegram.service.tsx';
import {setWebhook, unsetWebhook} from "../../telegramBot/telegram.api.tsx";

const router = Router();

router.get('/switchOnWebhook', auth.required, async function (_req: Request, res: Response) {
  try {
    const result = await setWebhook()
    return res.json(result);
  } catch (error) {
    return res.status(500).json({message: error?.message});
  }
})

router.get('/switchOffWebhook', auth.required, async function (_req: Request, res: Response) {
  try {
    const result = await unsetWebhook()
    return res.json(result);
  } catch (error) {
    return res.status(500).json({message: error?.message});
  }
})

//api for TG, get updates
router.post('/listenWebHook', auth.optional, async function (req: Request, res: Response) {
  const secretToken = req.get('X-Telegram-Bot-Api-Secret-Token');
  if (secretToken !== process.env.CHECK_HEALTH_TELEGRAM_WEBHOOK_SECRET) {
    return res.sendStatus(401);
  }

  const body = req.body;
  // Telegram переотправляет апдейт, если ответ не пришёл за несколько секунд, а разбор
  // PDF столько и длится: дождавшись его, получили бы дубль (§10). Поэтому отвечаем
  // сразу, а обработку не ждём.
  // Раз ответ уже ушёл, ошибку некому вернуть: без лога она пропала бы совсем.
  // Пишем только код и error.name — текст исключения может цитировать содержимое
  // файла или сообщения (§14).
  manageTgUpdates(body).catch((error) => {
    console.error(
      `webhook update failed: update=${body?.update_id} code=update_processing`
      + ` error=${error instanceof Error ? error.name : 'unknown'}`
    );
  });

  return res.sendStatus(200);
})
export default router;
