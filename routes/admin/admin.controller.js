import {Router} from 'express';
import auth from '../auth/auth.js';
import { addTGUpdates} from '../../telegramBot/telegram.service.js'
import {setWebhook, unsetWebhook} from "../../telegramBot/telegram.api.js";

const router = Router();

router.get('/switchOnWebhook', auth.required, async function (req, res, next) {
    try {
        const result = await setWebhook()
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
})

router.get('/switchOffWebhook', auth.required, async function (req, res, next) {
    try {
        const result = await unsetWebhook()
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
})

//api for TG, get updates
router.post('/listenWebHook', auth.optional, async function (req, res) {
    const body = req.body;
    try {
        await addTGUpdates(body);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
})

export default router;