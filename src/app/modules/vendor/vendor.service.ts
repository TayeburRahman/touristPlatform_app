import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { IAuth, IAuthModel, IReqUser } from '../auth/auth.interface';
import { RequestData } from '../../../interfaces/common';
import Vendor, { Advertise } from './vendor.model';
import { IAdvertise, IVendor } from './vendor.interface';
import { sendResetEmail } from '../auth/sendResetMails';
import User from '../user/user.model';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';

interface DeleteAccountPayload {
  email: string;
  password: string;
}

// --- Advertise Us From ---------------
const createAdvertiseUsFrom = async (req: RequestData) => {

  // const {userId, authId} = req.user as IReqUser;

  const data = req.body as {
    name: string,
    phone: string,
    email: string,
    business_name: string,
    massage: string, 
    userId: any,
    authId: any,
    }

    // data.userId = userId;
    // data.authId = authId;

  const { email } = data;  

  const checkUser = await Advertise.findOne({ email });
  if (checkUser?.status === "approved"){
    throw new ApiError(httpStatus.BAD_REQUEST, "This vendor email is already exists!");
  }

  if(checkUser){
    await Advertise.findByIdAndDelete(checkUser._id)
  } 

  const newAdvertise = new Advertise(data);
  await newAdvertise.save();

  return newAdvertise;
}

const getPaddingRequest = async () => {
  const data = await Advertise.find({status: "pending"})
  return data;
}

const approveAdvertise = async (req: RequestData) => {
  const { id }: any = req.params
  const data = req.body as {
    status: string;
    email: string;
    verify_code: string;
  };

  if (!data.email || !data.verify_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing email or verify code");
  };

  const update = await Advertise.findByIdAndUpdate(
    id,
    {
      status: data.status,
      verify_code: data.verify_code
    },
    { new: true }
  );

  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, "Advertisement not found");
  }

  sendResetEmail(
    data.email,
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
              <h1>Hello, ${update.name}</h1>
              <p>Your Vendor business profile verify code is: <strong>${data.verify_code}</strong></p> 
              <p>Thank you!</p>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} bdCalling</p>
              </div>
          </div>
      </body>
      </html>`
  );

  return update;
};

const declinedAdvertise = async (req: RequestData) => {
  const { id }: any = req.params
  const data = req.body as {
    text: string;
  };

  const dbData = await Advertise.findById(id) as IAdvertise
  if (!dbData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Advertise from not fount.");
  }

  const update = await Advertise.findByIdAndUpdate(
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

// --- Vendor Request ---------------
const sendVendorRequest = async (req: RequestData) => { 
  const {userId, authId} = req.user as IReqUser;
  const { files } = req; 

  const {
    vendor_name,
    social_media,  
    vendor_email,
    verify_code,
    latitude,
    longitude,
  } = req.body as any; 

  const userExist = await Auth.findById(authId)  

  if(!userExist){
    throw new ApiError(httpStatus.NOT_FOUND, "Login user not found!");
  }
 
  const dataDB = await Advertise.findOne({ email: vendor_email }) as IAdvertise;
  if (!dataDB) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your business profile application was not found. Please apply using the 'Advertise with Us' form.");
  }
   
  if (dataDB.status === "pending") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This Business is not approved yet!");
  }

  if (dataDB.status === "declined") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This Business was declined. Please check your email for the reason!");
  } 

  if (dataDB.verify_code !== verify_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Business Verify Code!");
  }

  if (dataDB.otp_verify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your vendor profile request has already been submitted. Please wait for admin approval.");
  } 
  
  let banner: string | undefined;

  if (files?.banner) {
    banner = `/vendor/${files.banner[0].filename}`;
  } 
 
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
 
  const vendorData = { 
    email: userExist.email,  
    vendor_email: dataDB.email,
    name: userExist.name,
    phone_number: dataDB?.phone,
    vendor_name,
    banner,
    location,
    userId: userId,
    authId: authId
  };

  const newVendor = new Vendor(vendorData);
  const result = await newVendor.save();

  await Advertise.findByIdAndUpdate(dataDB._id, { otp_verify: true });

  return result;
}; 

const acceptVendorRequest = async (req: RequestData) => { 
  const { id } = req.params as { id: string }; 
  const vendor = await Vendor.findById(id) as IVendor; 
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  const authCheckExists: any = await Auth.findById(vendor?.authId);
  if (authCheckExists?.role === "VENDOR") {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'This user already has a vendor account!');
  }
  const userCheckExists = await User.findById(vendor?.userId);
  let vendorData: Partial<IVendor> = {};  
  if (authCheckExists?.role === "USER") {  
    if (userCheckExists) { 
      await User.findOneAndUpdate({ email: vendor.email },  { status: "upgraded" }); 
      // Create a new token (if you plan to use it)
      const token = jwtHelpers.createToken(
        {
          authId: authCheckExists._id,
          role: "VENDOR",
          userId: userCheckExists._id,
        },
        config.jwt.secret as string,
        config.jwt.expires_in as string
      );   
    }  
  }
  // vendorData.authId = authCheckExists?._id;  
  vendorData.profile_image = userCheckExists?.profile_image;  
  vendorData.cover_image = userCheckExists?.cover_image;  
  // vendorData.phone_number = userCheckExists?.phone_number;  
  vendorData.status = "active"; 
 
  const userUpdate = await Vendor.findByIdAndUpdate(id, vendorData, { new: true });
   
  const authUpdate  = await Auth.findByIdAndUpdate(authCheckExists._id, { role: "VENDOR" }, { new: true }) as IAuth;

  if(userUpdate){
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
};

const deleteVendorRequest  = async (req: RequestData) => {
  const { id }: any = req.params   
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Advertise from not fount.");
  } 
  const deleteVendor = await Vendor.findByIdAndDelete(id);
 
  return deleteVendor;
};

const getAllPending = async () => {
  const data = await Vendor.find({status: "pending"})
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
    if (files.banner && files.banner[0]) {
      fileUploads.banner = `/images/profile/${files.banner[0].filename}`;
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

  return result;
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

export const VendorService = {
  createAdvertiseUsFrom,
  declinedAdvertise,
  approveAdvertise,
  sendVendorRequest,
  acceptVendorRequest,
  getProfile,
  deleteMyAccount,
  updateProfile,
  deleteVendorRequest,
  getPaddingRequest,
  getAllPending
};

