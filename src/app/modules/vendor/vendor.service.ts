import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { IAuth, IReqUser } from '../auth/auth.interface';
import { RequestData } from '../../../interfaces/common';
import Vendor, { Advertise } from './vendor.model';
import { IAdvertise, IVendor } from './vendor.interface';
import { sendResetEmail } from '../auth/sendResetMails';

interface DeleteAccountPayload {
  email: string;
  password: string;
}


const createAdvertiseUsFrom = async (req: RequestData) => {
  const data = req.body as {
    name: string,
    phone: string,
    email: string,
    business_name: string,
    massage: string, 
    userId: any,
    }

  const { email } = data   

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

const approveAdvertise = async (req: RequestData) => {
  const { id }: any = req.params
  const data = req.body as {
    status: string;
    email: string;
    verify_code: string;
  };

  if (!data.email || !data.verify_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing email or verify code");
  }

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

// -----------------
const sendVendorRequest = async (req: RequestData) => { 
  const { files } = req;

  const {
    vendor_name,
    social_media,  
    vendor_email,
    verify_code,
    latitude,
    longitude,
  } = req.body as any; 
 
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
    userId: dataDB?.userId ? dataDB.userId : null, 
    email: dataDB.email,
    name: dataDB.name,
    vendor_name,
    banner,
    location,
  };
 
  const newVendor = new Vendor(vendorData);
  const result = await newVendor.save();

  await Advertise.findByIdAndUpdate(dataDB._id, { otp_verify: true });

  return result;
};





 
 

const acceptRequest = async (req: RequestData) => {
  const authId = req.user.authId;
  const { id } = req.params as any;

  const vendor = await Vendor.findById(id) as IVendor;
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

};

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
    if (files.licensePlateImage && files.licensePlateImage[0]) {
      fileUploads.licensePlateImage = `/images/vehicle-licenses/${files.licensePlateImage[0].filename}`;
    }
    if (files.drivingLicenseImage && files.drivingLicenseImage[0]) {
      fileUploads.drivingLicenseImage = `/images/driving-licenses/${files.drivingLicenseImage[0].filename}`;
    }
    if (files.vehicleInsuranceImage && files.vehicleInsuranceImage[0]) {
      fileUploads.vehicleInsuranceImage = `/images/insurance/${files.vehicleInsuranceImage[0].filename}`;
    }
    if (files.vehicleRegistrationCardImage && files.vehicleRegistrationCardImage[0]) {
      fileUploads.vehicleRegistrationCardImage = `/images/vehicle-registration/${files.vehicleRegistrationCardImage[0].filename}`;
    }
    if (files.vehicleFrontImage && files.vehicleFrontImage[0]) {
      fileUploads.vehicleFrontImage = `/images/vehicle-image/${files.vehicleFrontImage[0].filename}`;
    }
    if (files.vehicleBackImage && files.vehicleBackImage[0]) {
      fileUploads.vehicleBackImage = `/images/vehicle-image/${files.vehicleBackImage[0].filename}`;
    }
    if (files.vehicleSideImage && files.vehicleSideImage[0]) {
      fileUploads.vehicleSideImage = `/images/vehicle-image/${files.vehicleSideImage[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Vendor.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
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
  acceptRequest,
  getProfile,
  deleteMyAccount,
  updateProfile,
};

