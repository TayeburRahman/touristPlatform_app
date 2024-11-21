import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { IAuth, IAuthModel, IReqUser } from '../auth/auth.interface';
import { RequestData } from '../../../interfaces/common';
import Vendor, { Advertise } from './vendor.model';
import { IAdvertise, IVendor } from './vendor.interface';
import { sendResetEmail } from '../auth/sendResetMails';
import { logger } from '../../../shared/logger';
import cron from "node-cron";
import { Plan } from '../payment/payment.model';
import { ENUM_USER_ROLE } from '../../../enums/user';
import mongoose from 'mongoose';
import Event from '../event/event.model';

interface DeleteAccountPayload {
  email: string;
  password: string;
}

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Vendor.updateMany(
      {
        expiredDate: { $lte: now },
      },
      {
        $unset: { package: null, plan: null },
      }
    );

    await Plan.updateMany(
      {
        end_date: { $lte: now },
      },
      {
        $unset: { active: false },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Removed package from ${result.modifiedCount} expired.`);
    }
  } catch (error) {
    logger.error("Error removing package from expired.:", error);
  }
});

const vendorRegister = async (req: any) => {
  const { files, body: data } = req;
  const { password, confirmPassword, email, longitude, latitude , social_media, questions, ...other } = data;

  console.log("====", other.address)

  const role = "VENDOR"
  if (!password || !confirmPassword || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email, Password, and Confirm Password are required!");
  }

  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
  }

  const existingAuth: any = await Auth.findOne({ email });
  if (existingAuth) {
    if (existingAuth.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    } else {
      // Delete inactive existing user
      await Auth.deleteOne({ _id: existingAuth._id });
    }
  }

  const existingVendor: any = await Vendor.findOne({ email });
  if (existingVendor) {
    if (existingVendor.status === "active") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Vendor Profile Already Exists");
    } else {
      // Delete inactive existing vendor
      await Vendor.deleteOne({ email });
    }
  }

  if (role === "VENDOR" && (longitude && latitude)) {
    const location_map = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    other.location_map = location_map;
  } else if (role === "VENDOR" && (!longitude || !latitude)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Vendor location is required!");
  }

  if (files) {
    if (files.profile_image?.[0]) {
      other.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.banner?.[0]) {
      other.banner = `/vendor/${files.banner[0].filename}`;
    }
    if (files.business_profile?.[0]) {
      other.business_profile = `/vendor/${files.business_profile[0].filename}`;
    }
     
  } 

  const auth = {
    role,
    name: other.name,
    email,
    password,
    expirationTime: Date.now() + 3 * 60 * 1000,
  };
  
  console.log(social_media, questions)

  let createAuth = await Auth.create(auth);
  const parsMedia = JSON.parse(social_media)
  const parsQuestions = JSON.parse(questions)

  other.questions = parsQuestions
  other.social_media = parsMedia
  other.authId = createAuth?._id
  other.email = email;
  // Create vendor record if role is VENDOR
  let result;
  if (role === ENUM_USER_ROLE.VENDOR) {
    result = await Vendor.create(other);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role provided!");
  }
  // Return success message
  return { result, message: "Your account is awaiting admin approval!" };
};

const vendorRequest = async (req: RequestData) => {
  const { files, body: data } = req;
  const { longitude, latitude, social_media, questions, ...other } = req.body as any;
  const { authId, userId } = req.user

  if (!authId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required!");
  }

  const existingAuth = await Auth.findById(authId);

  if (!existingAuth?.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please log out and log back in to request.");
  }

  if (longitude && latitude) {
    const location_map = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    other.location_map = location_map;

  } else if (longitude || latitude) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Location are required if one is provided.");
  }

  if (files) {
    if (files.profile_image?.[0]) {
      other.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.banner?.[0]) {
      other.banner = `/vendor/${files.banner[0].filename}`;
    }
    if (files.business_profile?.[0]) {
      other.business_profile = `/vendor/${files.business_profile[0].filename}`;
    }
  }

  const parsMedia = JSON.parse(social_media)
  const parsQuestions = JSON.parse(questions) 
  other.questions = parsQuestions
  other.social_media = parsMedia

  other.authId = existingAuth._id;
  other.email = existingAuth?.email;
  other.name = existingAuth?.name;
  other.userId = userId;


  const result = await Vendor.create(other);

  return { result, message: "Request sent successfully!" };
};

const acceptVendorRequest = async (req: RequestData) => {
  const { id } = req.params as { id: string };
  const vendorDb = await Vendor.findById(id) as IVendor;
  const authDb: any = await Auth.findById(vendorDb?.authId);

  if (!vendorDb || !authDb) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor or Auth not found');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    if (authDb.role === "USER") {
      authDb.role = "VENDOR";
      await authDb.save();
    }

    const userUpdate = await Vendor.findByIdAndUpdate(id, { status: "approved" }, { new: true, session });

    const authUpdate = await Auth.findByIdAndUpdate(authDb._id, { isActive: true }, { new: true, session }) as IAuth;

    await session.commitTransaction();
    session.endSession();

    if (userUpdate) {
      sendResetEmail(
        authUpdate.email,
        `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Activation Code</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: auto;
                      background: white;
                      padding: 20px;
                      border-radius: 5px;
                      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                      color: #333;
                  }
                  p {
                      color: #555;
                      line-height: 1.5;
                  }
                  .footer {
                      margin-top: 20px;
                      font-size: 12px;
                      color: #999;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Hello, ${authUpdate.name}</h1>
                   <p>Your vendor account request has been accepted successfully.</p>
                  <p>Thank you!</p>
                  <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} bdCalling</p>
                  </div>
              </div>
          </body>
          </html>`
      );
    }

    return { userUpdate, authUpdate };

  } catch (error) {
    // Abort transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to accept vendor request');
  }
};

const declinedVendor = async (req: RequestData) => {
  const { id }: any = req.params
  const data = req.body as {
    text: string;
  };

  const dbData = await Vendor.findById(id) as IVendor;
  if (!dbData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile not fount.");
  }

  const update = await Vendor.findByIdAndUpdate(
    id,
    {
      status: 'declined',
      declined_text: data.text
    },
    { new: true }
  );


  sendResetEmail(
    dbData.email,
    `<!DOCTYPE html>
      <html lang="en">
     <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Advertisement Declined</title>
     <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            line-height: 1.5;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
     </style>
     </head>
     <body>
         <div class="container">
              <h1>Hello, ${dbData.name}</h1>
              <p>Thank you for submitting your advertisement with us. Unfortunately, we must inform you that your advertisement has been declined. Here is the reason provided:</p>
               <p><strong>${data.text}</strong></p> 
                  <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
                 <p>Thank you for your understanding.</p>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} bdCalling</p>
              </div>
         </div>
      </body>
      </html>`
  );

  return update;
};

const getAllPending = async () => {
  const data = await Vendor.find({ status: "pending" })
  return data;
}
// --- Vendor Profile ---------------
const updateProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user

  const checkValidDriver = await Vendor.findById(userId);
  if (!checkValidDriver) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.banner?.[0]) {
      fileUploads.banner = `/vendor/${files.banner[0].filename}`;
    }
    if (files.business_profile?.[0]) {
      fileUploads.business_profile = `/vendor/${files.business_profile[0].filename}`;
    }
  };

  const updatedUserData = { ...data, ...fileUploads };

  const [, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedUserData.name },
      {
        new: true,
        runValidators: true
      }
    ),
    Vendor.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true
    }),
  ]);

  return result;
};

const getProfile = async (user: { userId: string }) => {
  const userId = user.userId;
  const result = await Vendor.findById(userId).populate("authId");

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  const featured = await Event.find({
    status: 'approved', vendor: userId, featured: { $ne: null }
  })
    .select('name event_image location category address')
    .populate('category', 'name')

  const events = await Event.find({
    status: 'approved', vendor: userId
  })
    .select('name event_image location category address')
    .populate('category', 'name')


  return { result, events, featured };
};

const deleteMyAccount = async (payload: DeleteAccountPayload) => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);

  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }

  await Vendor.deleteOne({ authId: isUserExist._id });
  return await Auth.deleteOne({ email });
};

const getVendorProfileDetails = async (params: { id: string }) => {
  const { id } = params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing vendor Id");
  }
  const result = await Vendor.findById(id)
    .select('address banner business_name description location_map profile_image social_media business_profile')

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  const featured = await Event.find({
    status: 'approved', vendor: id, featured: { $ne: null }
  })
    .select('name event_image location category address')
    .populate('category', 'name')

  const events = await Event.find({
    status: 'approved', vendor: id
  })
    .select('name event_image location category address')
    .populate('category', 'name')

  return { result, events, featured }; 
};

export const VendorService = {
  // sendAdvertiseUsFrom, 
  // approveAdvertise,
  // sendVendorRequest, 
  // deleteVendorRequest,
  vendorRegister,
  vendorRequest,
  declinedVendor,
  acceptVendorRequest,
  getAllPending,
  getProfile,
  deleteMyAccount,
  updateProfile,
  getVendorProfileDetails
};

