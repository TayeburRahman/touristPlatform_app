import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import Auth from "../auth/auth.model";
import { Request } from "express";
import { IAdmin } from "./admin.interface";
import Admin from "./admin.model";
import { IAuth } from "../auth/auth.interface";
import { ENUM_USER_ROLE } from "../../../enums/user";

interface IRequest extends Request {
  user: {
    userId: string;
    authId: string;
  };
} 
 
const createAdminAccount = async (payload: IAuth) => {
  const { role, password, confirmPassword, email, ...other } = payload;

 
  if (!role || !Object.values(ENUM_USER_ROLE).includes(role as any)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid role is required!");
  }
 
  if (!password || !confirmPassword || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email, password, and confirm password are required!");
  }
 
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match");
  } 

  const existingAuth = await Auth.findOne({ email }).lean();
  if (existingAuth) {
    if (existingAuth.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    } else { 
      await Admin.deleteOne({ authId: existingAuth._id });
    }
  } 
  const auth = {
    role,
    name: other.name,
    email,
    password,
    isActive: true,
  };

  const createAuth = await Auth.create(auth);

  other.authId = createAuth._id;
  other.email = email;
 
  const result = await Admin.create(other);

  return result;
};
 

export const AdminService = {
  createAdminAccount, 
};

 
