import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { PaymentController } from './payment.controller';

const router = Router();

router.post(
  '/create_intent',
  auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.VENDOR),
  PaymentController.makePaymentIntent,
);
router.post(
  '/success_intent',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR),
  PaymentController.paymentSuccessAndSave,
);

 

export const PaymentRoutes = router;
