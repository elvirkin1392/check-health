import {Router} from 'express';
import auth from '../auth/auth.js';
import { addTGUpdates} from '../../telegramBot/telegram.service.js'
import {setWebhook, unsetWebhook} from "../../telegramBot/telegram.api.js";
import {updateDbData} from "../../db/general.db.js";

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

router.get('/test', auth.optional, async function (req, res, next) {
    try {
        const user = {id: '388008868'};
        const command = 'cold_end';
        const data = {
            end_date: '2024-11-02T18:16:18.404Z'
        };
        const result = await updateDbData({user,command, data })
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
})

//api for TG, get updates
router.post('/listenWebHook', auth.optional, async function (req, res) {
    const body = req.body;
    console.log('listenWebHook', body);
    try {
        await addTGUpdates(body);
        console.log('listenWebHook send 200');
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
})

export default router;