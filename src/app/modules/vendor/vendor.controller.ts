import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface"; 
import { Request, RequestHandler, Response } from 'express'; 
import { VendorService } from "./vendor.service"; 


const createAdvertiseUsFrom = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.createAdvertiseUsFrom(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request send successfully",
    data: result,
  });
});

const getPaddingRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getPaddingRequest();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const approveAdvertise = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.approveAdvertise(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Approve successfully",
    data: result,
  });
});

const declinedAdvertise = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.declinedAdvertise(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request declined successfully",
    data: result,
  });
});

// ---------------- 
const sendVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.sendVendorRequest(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request send successfully",
    data: result,
  });
});

const acceptVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.acceptVendorRequest(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Accept request successfully",
    data: result,
  });
}); 

const deleteVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.deleteVendorRequest(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request delete successfully",
    data: result,
  });
}); 

const getAllPending = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getAllPending();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

// -----------------

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
 const user =  req.user as IReqUser;
  const result = await VendorService.getProfile(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await VendorService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
});


export const VendorController = {
  createAdvertiseUsFrom,
  declinedAdvertise,
  approveAdvertise,
  sendVendorRequest,
  acceptVendorRequest,
  deleteMyAccount,
  getProfile,
  updateProfile,
  deleteVendorRequest,
  getPaddingRequest,
  getAllPending
};
 