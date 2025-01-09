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
import QueryBuilder from '../../../builder/QueryBuilder';
import { acceptedVendorRequest, sendVendorDeclined, sendVendorRequest } from '../../../mails/vendor.mail';

interface DeleteAccountPayload {
  email: string;
  password: string;
};

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
  try {
    const { files, body: data } = req;
    const { password, confirmPassword, email, longitude, latitude, social_media, questions, ...other } = data;

    const role = "VENDOR";
    if (!password || !confirmPassword || !email) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email, Password, and Confirm Password are required!");
    }

    if (password !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
    }

    if (!questions) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Questions are required!");
    } else {
      const parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Questions must be an array!");
      }
      parsedQuestions.forEach((q: any) => {
        if (!q?.question || q?.answer === undefined) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Each question must include a question and an answer!");
        }
      });
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

    let createAuth = await Auth.create(auth);

    if (social_media) other.social_media = JSON.parse(social_media);
    if (questions) other.questions = JSON.parse(questions);
    other.authId = createAuth?._id;
    other.email = email;

    // Create vendor record if role is VENDOR
    let result;
    if (role === ENUM_USER_ROLE.VENDOR) {
      result = await Vendor.create(other);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role provided!");
    }

    sendVendorRequest(
      other.email,
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vendor Request Submitted</title>
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
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            font-size: 24px;
          }
          p {
            color: #555;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello, ${other.name}!</h1>
          <p>We have received your vendor request for <strong>${other.business_name}</strong>. Thank you for your interest in partnering with us!</p>
          <p>Our team will review your application and get back to you shortly. If we need any additional information, we will reach out to the email address provided.</p>
          <p>In the meantime, if you have any questions or need further assistance, feel free to contact us.</p>
          <p style="margin: 20px 0;">
            <a href="www.whatsupjaco.com" class="button">Contact Support</a>
          </p>
          <p>We appreciate your patience and look forward to working with you!</p>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Whatsupjaco.com. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`
    );

    // Return success message
    return { result, message: "Your account is awaiting admin approval!" };

  } catch (error: any) {
    console.error("Error in vendorRegister function:", error.message, error.stack);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred!");
  }
};
















const vendorRequest = async (req: RequestData) => {
  const { files, body: data } = req;
  const { longitude, latitude, social_media, questions, ...other } = req.body as any;
  const { authId, userId } = req.user

  const requiredFields = [
    "business_name",
    "name",
    "email",
    "banner",
    "address",
    "phone_number",
    "profile_image",
    "business_profile",
    // "location_map",
    "description"
  ];

  for (const field of requiredFields) {
    if (!other[field]) {
      throw new ApiError(400, `${field} is required.`);
    }
  };

  if (!authId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required!");
  }

  const existingAuth = await Auth.findById(authId);

  if (!questions) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Questions are required!");
  } else {
    const parsedQuestions = JSON.parse(questions);
    if (!Array.isArray(parsedQuestions)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Questions must be an array!");
    }
    parsedQuestions.map((q: any) => {
      if (!q?.question || q?.answer === undefined) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Each question must include a question and an answer!");
      }
    });
  }

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

  if (social_media) other.social_media = JSON.parse(social_media)
  if (questions) other.questions = JSON.parse(questions)
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

  console.log("==id=", id);
  console.log("==vendor=", vendorDb);
  console.log("==auth=", authDb);

  if (!vendorDb || !authDb) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor or Auth not found');
  }

  try {
    if (authDb.role === "USER") {
      authDb.role = "VENDOR";
      await authDb.save();
    }

    const userUpdate = await Vendor.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    const authUpdate = await Auth.findByIdAndUpdate(authDb._id, { isActive: true }, { new: true }) as IAuth;

    if (userUpdate) {
      acceptedVendorRequest(
        authUpdate.email,
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Request Approval</title>
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
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
            font-size: 24px;
        }
        p {
            color: #555555;
            font-size: 16px;
            line-height: 1.6;
        }
        .cta-button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .cta-button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, ${authUpdate.name}</h1>
        <p>We are excited to inform you that your vendor account request has been approved!</p>
        <p>Your account is now active, and you can start managing your business through our platform.</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>

        <a href="https://whatsupjaco.com/dashboard" class="cta-button">Go to Dashboard</a>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Whatsupjaco.com. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
      );
    }
    return { userUpdate, authUpdate };

  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to accept vendor request');
  }
};

// const declinedVendor = async (req: RequestData) => {
//   const { id }: any = req.params
//   const data = req.body as {
//     text: string;
//   };

//   const dbData = await Vendor.findById(id) as IVendor;
//   if (!dbData) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Profile not fount.");
//   }

//   const update = await Vendor.findByIdAndUpdate(
//     id,
//     {
//       status: 'declined',
//       declined_text: data.text
//     },
//     { new: true }
//   );


//   sendResetEmail(
//     dbData.email,
//     `<!DOCTYPE html>
//       <html lang="en">
//      <head>
//      <meta charset="UTF-8">
//      <meta name="viewport" content="width=device-width, initial-scale=1.0">
//      <title>Advertisement Declined</title>
//      <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 20px;
//         }
//         .container {
//             max-width: 600px;
//             margin: auto;
//             background: white;
//             padding: 20px;
//             border-radius: 5px;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//         }
//         h1 {
//             color: #333;
//         }
//         p {
//             color: #555;
//             line-height: 1.5;
//         }
//         .footer {
//             margin-top: 20px;
//             font-size: 12px;
//             color: #999;
//         }
//      </style>
//      </head>
//      <body>
//          <div class="container">
//               <h1>Hello, ${dbData.name}</h1>
//               <p>Thank you for submitting your advertisement with us. Unfortunately, we must inform you that your advertisement has been declined. Here is the reason provided:</p>
//                <p><strong>${data.text}</strong></p> 
//                   <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
//                  <p>Thank you for your understanding.</p>
//               <div class="footer">
//                   <p>&copy; ${new Date().getFullYear()} bdCalling</p>
//               </div>
//          </div>
//       </body>
//       </html>`
//   );

//   return update;
// };
const getAllPending = async () => {
  const data = await Vendor.find({ status: "pending" })
  return data;
};
// --- Vendor Profile ---------------
const updateProfile = async (req: RequestData) => {
  const { files } = req;
  const data = req.body as IVendor;
  const { authId, userId } = req.user;

  const existingVendor = await Vendor.findById(userId);
  if (!existingVendor) {
    throw new ApiError(404, "Vendor not found or unauthorized.");
  }

  console.log("authId", authId)

  if (files) {
    if (files.profile_image?.[0]) {
      data.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.banner?.[0]) {
      data.banner = `/vendor/${files.banner[0].filename}`;
    }
    if (files.business_profile?.[0]) {
      data.business_profile = `/vendor/${files.business_profile[0].filename}`;
    }
  }


  if (data?.social_media) data.social_media = JSON.parse(data.social_media as any);
  if (data?.questions) data.questions = JSON.parse(data.questions as any);

  data.status = existingVendor.status

  const updatedUserData = { ...data };

  const [authUpdate, vendorUpdate] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedUserData.name },
      {
        new: true,
        runValidators: true,
      }
    ),
    Vendor.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  if (!authUpdate || !vendorUpdate) {
    throw new ApiError(500, "Failed to update profile.");
  }

  return vendorUpdate;
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
    .select('name event_image location category address end_date date')
    .populate('category', 'name')

  return { result, events, featured };
};
const getAllVendor = async (req: any) => {
  const query = req.query as any;
  const categoryQuery = new QueryBuilder(
    Vendor.find()
      // .select('name event_image location category address')
      .populate('userId')
    ,
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();


  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();
  return { result, meta }
}
const updateVendorStatus = async (req: any) => {
  const { id, status } = req.query as any;
  const { reasons } = req.body as any;

  if (!id || !status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing vendor Id or status");
  }

  const validStatuses = ['pending', 'approved', 'declined', 'deactivate'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
  }

  if (status === 'declined' && !reasons) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reasons are required for declining vendor");
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  let authData;
  if (status === 'deactivate') {
    authData = await Auth.findByIdAndUpdate(vendor?.authId, { isActive: false, is_block: true });
  }
  if (status === 'approved') {
    authData = await Auth.findByIdAndUpdate(vendor?.authId, { isActive: true, is_block: false });

    acceptedVendorRequest(
      vendor.email,
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Request Approval</title>
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
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
          color: #333333;
          font-size: 24px;
      }
      p {
          color: #555555;
          font-size: 16px;
          line-height: 1.6;
      }
      .cta-button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #ffffff;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
      }
      .cta-button:hover {
          background-color: #0056b3;
      }
      .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #999999;
          text-align: center;
      }
  </style>
</head>
<body>
  <div class="container">
      <h1>Hello, ${vendor.name}</h1>
      <p>We are excited to inform you that your vendor account request has been approved!</p>
      <p>Your account is now active, and you can start managing your business through our platform.</p>
      <p>If you have any questions or need assistance, feel free to contact our support team.</p>

      <a href="https://whatsupjaco.com/dashboard" class="cta-button">Go to Dashboard</a>

      <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Whatsupjaco.com. All rights reserved.</p>
      </div>
  </div>
</body>
</html>`
    );
  }


  const updatedVendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });

  if (status === 'declined') {
    sendVendorDeclined(
      vendor.email,
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
                <h1>Hello, ${vendor.name}</h1>
                <p>Thank you for submitting your advertisement with us. Unfortunately, we must inform you that your advertisement has been declined. Here is the reason provided:</p>
                 <p><strong>${reasons}</strong></p> 
                    <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
                   <p>Thank you for your understanding.</p>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Whatsupjaco.com</p>
                </div>
           </div>
        </body>
        </html>`
    );
  }

  return updatedVendor
};


export const VendorService = {
  // sendAdvertiseUsFrom, 
  // approveAdvertise,
  // sendVendorRequest, 
  // deleteVendorRequest,
  vendorRegister,
  vendorRequest,
  // declinedVendor,
  acceptVendorRequest,
  getAllPending,
  getProfile,
  deleteMyAccount,
  updateProfile,
  getVendorProfileDetails,
  getAllVendor,
  updateVendorStatus
};

