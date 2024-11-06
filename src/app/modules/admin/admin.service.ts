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

const updateProfile = async (req: IRequest): Promise<IAdmin | null> => {
  const { files } = req as any;
  const { userId, authId } = req.user; 
  const data = req.body;
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data is missing in the request body.");
  }

  const checkUser = await Admin.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  let profile_image: string | undefined;
  if (files?.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  let cover_image: string | undefined;
  if (files?.cover_image) {
    cover_image = `/images/cover/${files.cover_image[0].filename}`;
  }

  const updatedData = {
    ...data,
    ...(profile_image && { profile_image }),
    ...(cover_image && { cover_image }),
  };

  await Auth.findOneAndUpdate(
    { _id: authId },
    { name: updatedData.name },
    { new: true }
  );

  const updateUser = await Admin.findOneAndUpdate({ authId }, updatedData, {
    new: true,
  }).populate("authId");

  return updateUser;
};

const myProfile = async (req: IRequest): Promise<IAdmin | null> => {
  const { userId } = req.user;
  const result = await Admin.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return result;
};

const deleteMyAccount = async (payload: { email: string; password: string }): Promise<void> => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.PAYMENT_REQUIRED, "Password is incorrect");
  }

  await Admin.deleteOne({ authId: isUserExist._id });
  await Auth.deleteOne({ email });
};

export const AdminService = {
  createAdminAccount,
  updateProfile,
  myProfile,
  deleteMyAccount,
};

 
