import {Router} from 'express';
import authController from './auth/auth.controller.tsx';
import {profileRouter} from "./profile/profile.router.tsx";
import adminController from './admin/admin.controller.tsx';

const api = Router()
  .use(profileRouter)
  .use(adminController)
  .use(authController);

export default Router().use('/api', api);
