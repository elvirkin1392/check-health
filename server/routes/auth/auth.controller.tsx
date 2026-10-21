import {Router, Request, Response} from 'express';

import auth from './auth.tsx';
import {codeVerification, login, loginWithTelegramWebApp} from './auth.service.tsx';

const router = Router();

router.post("/auth", auth.optional, async function (req: Request, res: Response) {
  try {
    const user = await login(req.body.username);
    res.json(user);
  } catch (error) {
    console.error(error)
    // sendStatus takes only a status; the error argument here was always ignored.
    res.sendStatus(500);
  }
});

router.post("/codeVerification", auth.optional, async function (req: Request, res: Response) {
  try {
    const user = await codeVerification(req.body.username, req.body.code);
    res.json(user);
  } catch (error) {
    console.error(error)
    // sendStatus takes only a status; the error argument here was always ignored.
    res.sendStatus(500);
  }
});

router.post("/telegramAuth", auth.optional, async function (req: Request, res: Response) {
  try {
    const user = await loginWithTelegramWebApp(req.body.initData, req.body.timeZone);
    res.json(user);
  } catch (error) {
    console.error(error)
    res.status(error.errorCode || 500).json({message: error?.message});
  }
});

export default router;