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

const myProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.myProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AdminService.deleteMyAccount(data as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your admin account deleted successfully",
    data: result,
  });
});
 
export const AdminController = {
  createAdminAccount,
  myProfile,
  updateProfile,
  deleteMyAccount, 
};