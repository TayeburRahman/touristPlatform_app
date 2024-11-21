import express from 'express';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { PaymentController } from './payment.controller';
import bodyParser from 'body-parser'; 

const router = Router();

router.post(
  '/create_intent',
  auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.VENDOR),
  PaymentController.makePaymentIntent,
);
router.post(
  '/checkout-session',
  auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.VENDOR),
  PaymentController.createCheckoutSession,
); 

// router.post(
//   '/payments/webhook',
//   express.raw({ type: 'application/json' }), 
//   PaymentController.checkAndUpdateStatusByWebhook
// );

router.get(
  '/plan_history',
  auth(ENUM_USER_ROLE.VENDOR),
  PaymentController.userPlanHistory,
);


 
 

export const PaymentRoutes = router;
