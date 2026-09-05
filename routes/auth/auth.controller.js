import {Router} from 'express';

import auth from './auth.js';
import {codeVerification, login, loginWithTelegramWebApp} from './auth.service.js';

const router = Router();

router.post("/auth", auth.optional, async function (req, res) {
  try {
    const user = await login(req.body.username);
    res.json(user);
  } catch (error) {
    console.error(error)
    res.sendStatus(500, error);
  }
});

router.post("/codeVerification", auth.optional, async function (req, res) {
  try {
    const user = await codeVerification(req.body.username, req.body.code);
    res.json(user);
  } catch (error) {
    console.error(error)
    res.sendStatus(500, error);
  }
});

router.post("/telegramAuth", auth.optional, async function (req, res) {
  try {
    const user = await loginWithTelegramWebApp(req.body.initData);
    res.json(user);
  } catch (error) {
    console.error(error)
    res.status(error.errorCode || 500).json({message: error?.message});
  }
});

export default router;