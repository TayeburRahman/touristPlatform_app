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
 

// --- Vendor Request ---------------

const acceptVendorRequest = async (req: RequestData) => { 
  const { id } = req.params as { id: string }; 

  const vendorDb = await Vendor.findById(id) as IVendor; 
  const authDb: any = await Auth.findById(vendorDb?.authId);
  if (!vendorDb || !authDb) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  } 
  const userUpdate = await Vendor.findByIdAndUpdate(id, { status: "approved" }, { new: true });
   
  const authUpdate  = await Auth.findByIdAndUpdate(authDb._id, { isActive: true }, { new: true }) as IAuth;

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
  // sendAdvertiseUsFrom, 
  // approveAdvertise,
  // sendVendorRequest, 
  // deleteVendorRequest,
  // getPaddingRequest,
  declinedVendor,
  acceptVendorRequest, 
  getAllPending,
  getProfile,
  deleteMyAccount,
  updateProfile,
};

