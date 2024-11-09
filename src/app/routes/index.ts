import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { VendorRoutes } from '../modules/vendor/vendor.routes';
import { ManageRoutes } from '../modules/settings/settings.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import { eventRoutes } from '../modules/event/event.route';
import { PaymentRoutes } from '../modules/payment/payment.routes';

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
  // -- Inprogress
  {
    path: '/events',
    route: eventRoutes,
  },
  // -- Inprogress
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  // -- Done
  {
    path: '/rules',
    route: ManageRoutes,
  },
  // -- Padding
  {
    path: '/notification',
    route: NotificationRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
