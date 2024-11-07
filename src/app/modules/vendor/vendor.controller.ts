import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface"; 
import { Request, RequestHandler, Response } from 'express'; 
import { VendorService } from "./vendor.service"; 
 
// ------------------------------
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

// ---------------------
const declinedVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.declinedVendor(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request declined successfully",
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

const getAllPending = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getAllPending();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});


export const VendorController = {
  // sendAdvertiseUsFrom, 
  // approveAdvertise,
  // sendVendorRequest, 
  // deleteVendorRequest,
  // getPaddingRequest,
  declinedVendor,
  acceptVendorRequest, 
  getAllPending,
  deleteMyAccount,
  getProfile,
  updateProfile,
};
 