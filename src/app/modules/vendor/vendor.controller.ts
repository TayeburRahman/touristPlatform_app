import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface"; 
import { Request, RequestHandler, Response } from 'express'; 
import { VendorService } from "./vendor.service"; 
import { RequestData } from "../../../interfaces/common";
 

const vendorRegister = catchAsync(async (req: Request, res: Response) => {
  const result =  await VendorService.vendorRegister(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:"Your account is awaiting admin approval!",
    data: result,
  });
});

const vendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result =  await VendorService.vendorRequest(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:"Request send successfully",
    data: result,
  });
});

// ---------------------
// const declinedVendor = catchAsync(async (req: Request, res: Response) => {
//   const result = await VendorService.declinedVendor(req as any);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Request declined successfully",
//     data: result,
//   });
// });

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

const getVendorProfileDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getVendorProfileDetails(req.params as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  console.log("Update profile", req.body)
  const result = await VendorService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Update successfully",
    data: result,
  });
});

const getAllVendor = catchAsync(async (req: Request, res: Response) => {
  console.log("Update profile", req.body)
  const result = await VendorService.getAllVendor(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get all successfully",
    data: result,
  });
});

const updateVendorStatus = catchAsync(async (req: Request, res: Response) => { 
  const { status } = req.query as any;
 
  const result = await VendorService.updateVendorStatus(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Vendor ${status} successfully`,
    data: result,
  });
});
 
 

export const VendorController = {
  vendorRegister,
  // declinedVendor,
  acceptVendorRequest, 
  getAllPending,
  vendorRequest, 
  getVendorProfileDetails,
  updateProfile,
  getAllVendor,
  updateVendorStatus
   
};
 