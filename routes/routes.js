import { Router } from 'express';
import authController from './auth/auth.controller.js';
import profileController from './profile/profile.controller.js';
import adminController from './admin/admin.controller.js'

const api = Router()
    .use(profileController)
    .use(adminController)
    .use(authController);

export default Router().use('/api', api);