 
import { Request, RequestHandler, Response } from 'express';  
import catchAsync from '../../../shared/catchasync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/sendResponse';
import config from '../../../config';
import { IReqUser } from './auth.interface';

const registrationAccount = catchAsync(async (req: Request, res: Response) => {
  const { role } = await AuthService.registrationAccount(req.body);
  let message : any;
  message= role === "USER" && "Please check your email for the activation OTP code."
   message= role === "VENDOR" && "Your account is awaiting admin approval.";
   message= role === "ADMIN" && "Successfully create account!.";

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data: role,
  });
});

const activateAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.activateAccount(req.body);
  const { refreshToken } = result;

  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Activation code verified successfully.",
    data: result,
  });
});

const loginAccount = catchAsync(async (req: Request, res: Response) => {
  const loginData = req.body;
  const result = await AuthService.loginAccount(loginData);
  const { refreshToken } = result;
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const passwordData = req.body;
  const user = req.user as IReqUser;
  await AuthService.changePassword(user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});

const profileDetails = catchAsync(async (req: Request, res: Response) => {  
  const data = await AuthService.profileDetails(req);

  // Send the response
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile details retrieved successfully!",
    data,
  });
});


const forgotPass = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Code verified successfully",
    data: result,
  });
});

const resendCodeActivationAccount = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.resendCodeActivationAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resendCodeForgotAccount = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.resendCodeForgotAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resendActivationCode = catchAsync(async (req: Request, res: Response) => {
  // const data = req.body;
  // const result = await AuthService.resendActivationCode(data);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "Resent successfully",
  //   data: result,
  // });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password has been reset successfully.",
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const deleteMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.deleteMyProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const AuthController = {
  registrationAccount,
  activateAccount,
  loginAccount,
  changePassword,
  forgotPass,
  resetPassword,
  resendActivationCode,
  checkIsValidForgetActivationCode,
  resendCodeActivationAccount,
  resendCodeForgotAccount,
  profileDetails,
  updateProfile,
  deleteMyProfile

};
 