import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { PaymentService } from './payment.service';
import sendResponse from '../../../shared/sendResponse';

const makePaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.makePaymentIntent(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent create successfully',
    data: result,
  });
});

const paymentSuccessAndSave = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentSuccessAndSave(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Save successfully',
    data: result,
  });
});

const userPlanHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.userPlanHistory(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Save successfully',
    data: result,
  });
});

export const PaymentController = {
  makePaymentIntent,
  paymentSuccessAndSave,
  userPlanHistory
};
