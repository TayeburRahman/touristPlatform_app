import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { MessageRoutes } from '../modules/messages/message.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { VendorRoutes } from '../modules/vendor/auth.routes';

const router = express.Router();

const moduleRoutes = [
  // -- padding
  {
    path: '/auth',
    route: AuthRoutes,
  }, 
  // -- padding
  {
    path: '/vendor',
    route: VendorRoutes,
  },
  // -- padding
  {
    path: '/message',
    route: MessageRoutes,
  },
  // -- progressing
  {
    path: '/notification',
    route: NotificationRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
