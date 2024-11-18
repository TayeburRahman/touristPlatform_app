import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchasync";
import { IReqUser } from "../auth/auth.interface";

// const updateProfile = catchAsync(async (req: Request, res: Response) => {
//   const result = await UserService.updateProfile(req as any);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Profile updated successfully",
//     data: result,
//   });
// });

 

export const UserController = {
 
};
 
