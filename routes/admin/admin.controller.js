import {Router} from 'express';
import auth from '../auth/auth.js';
import {switchOnTGWebhook, switchOffTGWebhook, addTGUpdates} from '../../telegramBot/telegram.service.js'

const router = Router();

router.get('/switchOnWebhook', auth.required, async function (req, res, next) {
    try {
        const result = await switchOnTGWebhook()
        res.json(result);
    } catch (error) {
        next(error);
    }
})

router.get('/switchOffWebhook', auth.required, async function (req, res, next) {
    try {
        const result = await switchOffTGWebhook()
        res.json(result);
    } catch (error) {
        next(error);
    }
})

//api for TG, get updates
router.post('/listenWebHook', auth.optional, async function (req, res, next) {
    const request = req.body;
    console.log('listenWebHook', request);
    try {
        const result = await addTGUpdates(request)
        res.json(result);
    } catch (error) {
        next(error);
    }
})

export default router;