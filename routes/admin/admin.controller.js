import {Router} from 'express';
import auth from '../auth/auth.js';
import {addTGUpdates} from '../../telegramBot/telegram.service.tsx';
import {setWebhook, unsetWebhook} from "../../telegramBot/telegram.api.js";

const router = Router();

router.get('/switchOnWebhook', auth.required, async function (req, res, next) {
  try {
    const result = await setWebhook()
    return res.json(result);
  } catch (error) {
    return res.status(500).json({message: error?.message});
  }
})

router.get('/switchOffWebhook', auth.required, async function (req, res, next) {
  try {
    const result = await unsetWebhook()
    return res.json(result);
  } catch (error) {
    return res.status(500).json({message: error?.message});
  }
})

//api for TG, get updates
router.post('/listenWebHook', auth.optional, async function (req, res) {
  const body = req.body;
  try {
    await addTGUpdates(body);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({message: error?.message});
  }
})

export default router;