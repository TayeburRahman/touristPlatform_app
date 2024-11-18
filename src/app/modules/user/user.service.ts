import ApiError from "../../../errors/ApiError";
 
import httpStatus from "http-status";
import { RequestData } from "../../../interfaces/common";
import Auth from "../auth/auth.model";
import { IUser } from "./user.interface";
import User from "./user.model";

 
 
 
// const getProfile = async (user: { userId: string }): Promise<IUser> => {
//   const { userId } = user;
//   const result = await User.findById(userId).populate("authId");
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//   }

//   const auth = await Auth.findById(result.authId);
//   if (auth?.is_block) {
//     throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
//   }

//   return result;
// };
 
export const UserService = {
 
};
 
