import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { PaymentService } from './payment.service';
import sendResponse from '../../../shared/sendResponse';

const paymentSuccessAndSave = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentSuccessAndSave(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent create successfully',
    data: result,
  });
}); 

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createCheckoutSession(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment checkout session create successfully',
    data: result,
  });
});

const checkAndUpdateStatusByWebhook = catchAsync(async (req: any, res: Response) => {
  const result = await PaymentService.checkAndUpdateStatusByWebhook(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Save successfully',
    data: result,
  });
}); 

const userPlanHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.userPlanHistory(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Save successfully',
    data: result,
  });
});

export const PaymentController = {
  paymentSuccessAndSave,
  checkAndUpdateStatusByWebhook, 
  userPlanHistory,
  createCheckoutSession
};
