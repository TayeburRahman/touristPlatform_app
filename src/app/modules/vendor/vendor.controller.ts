import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface"; 
import { Request, RequestHandler, Response } from 'express'; 
import { VendorService } from "./vendor.service"; 
 

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

const getVendorProfileDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getVendorProfileDetails(req.params as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});
 

export const VendorController = {
  vendorRegister,
  declinedVendor,
  acceptVendorRequest, 
  getAllPending,
  vendorRequest, 
  getVendorProfileDetails
};
 