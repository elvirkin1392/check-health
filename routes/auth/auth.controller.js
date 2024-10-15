import {Router} from 'express';

import auth from './auth.js';
import {login} from './auth.service.js';

const router = Router();

router.post("/auth", auth.optional, async function (req, res) {
  try {
    const user = await login(req.body.username);
    res.json(user);
  } catch (error) {
    console.error(error)
    res.sendStatus(500, error);
  }
})
export default router;