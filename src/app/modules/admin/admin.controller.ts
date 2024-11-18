import { Request, RequestHandler, Response } from 'express';  
import catchAsync from '../../../shared/catchasync';
import { AdminService } from './admin.service'; 
import sendResponse from '../../../shared/sendResponse';

const createAdminAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createAdminAccount(req.body as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successfully create account!",
    data: result,
  });
});

 
 
export const AdminController = {
  createAdminAccount, 
};