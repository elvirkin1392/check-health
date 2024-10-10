import {Router} from 'express';
import auth from './auth.js';
import {createUser, getCurrentUser, login, updateUser} from './auth.service.js';

const router = Router();

router.post("/auth", auth.optional, async function (req, res, next) {
    console.log('POST: api/auth', req.body.username);

    try {
        const user = await login(req.body.username);
        res.json(user);
    } catch (error) {
        next(error.message);
    }
})
export default router;