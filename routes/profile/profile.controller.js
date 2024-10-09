import {Router} from 'express';
import auth from '../auth/auth.js';

const router = Router();

router.post("/profile", auth.optional, async function (req, res, next) {
    console.log('POST: api/profile', req.body.username);

    try {
        res.json({message: 'ok'});
    } catch (error) {
        next(error);
    }
})
export default router;