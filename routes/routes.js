import {Router} from 'express';
import authController from './auth/auth.controller.js';
import {profileRouter} from "./profile/profile.router.js";
import adminController from './admin/admin.controller.js';

const api = Router()
  .use(profileRouter)
  .use(adminController)
  .use(authController);

export default Router().use('/api', api);
