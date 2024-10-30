import express, { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AdminController } from '../admin/admin.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { AdminValidation } from '../admin/admin.validation';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import { VendorController } from '../vendor/vendor.controller';
import { UserController } from '../user/user.controller';

const router = express.Router();
//------ Auth Route -----------------
router.post("/register", AuthController.registrationAccount)
router.post("/login", AuthController.loginAccount)
router.post("/activate-user", AuthController.activateAccount)
router.post("/resend", AuthController.resendActivationCode)
router.post("/active-resend", AuthController.resendCodeActivationAccount)
router.post("/forgot-password", AuthController.forgotPass)
router.post("/forgot-resend", AuthController.resendCodeForgotAccount)
router.post("/verify-otp", AuthController.checkIsValidForgetActivationCode)
router.post("/reset-password", AuthController.resetPassword)
router.patch("/change-password",
  auth(
    ENUM_USER_ROLE.USER,
    // ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.SUPER_ADMIN
  ), AuthController.changePassword
);

//------ User Router ---------------
router.get("/user/profile", auth(ENUM_USER_ROLE.USER), UserController.getProfile)
router.patch(
  "/user/edit-profile",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  UserController.updateProfile
)
router.delete(
  "/user/delete-account",
  auth(ENUM_USER_ROLE.USER),
  UserController.deleteMyAccount
);

//------ Admin Router ---------------
router.post("/create_admin",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.createAdminAccount);
router.get(
  "/admin/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.myProfile
);
router.patch(
  "/admin/edit-profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AdminController.updateProfile
);
router.delete(
  "/admin/delete_account",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.deleteMyAccount
);

//------ Vendor Route -----------------
router.post("/vendor/send-request",
  // auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  VendorController.sendVendorRequest);

router.post("/vendor/accept-request/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.acceptRequest)

router.get("/profile", auth(ENUM_USER_ROLE.VENDOR), VendorController.getProfile);

router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.VENDOR),
  uploadFile(),
  VendorController.updateProfile
);
router.delete(
  "/delete-account",
  auth(ENUM_USER_ROLE.VENDOR),
  VendorController.deleteMyAccount
);



export const AuthRoutes = router;
