import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { MessageRoutes } from '../modules/messages/message.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { VendorRoutes } from '../modules/vendor/vendor.routes';
import { ManageRoutes } from '../modules/settings/settings.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import { eventRoutes } from '../modules/event/event.route';

const router = express.Router();

const moduleRoutes = [
  // -- Done
  {
    path: '/auth',
    route: AuthRoutes,
  },
  // -- Done
  {
    path: '/vendor',
    route: VendorRoutes,
  },
  // -- inprogress
  {
    path: '/events',
    route: eventRoutes,
  },
  // -- inprogress
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  // -- padding
  {
    path: '/message',
    route: MessageRoutes,
  },
  // -- padding
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/rules',
    route: ManageRoutes,
  }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
