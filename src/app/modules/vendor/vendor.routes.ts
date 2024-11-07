import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { VendorController } from './vendor.controller';

const router = express.Router();

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

// -----Admin -------------
router.patch("/accept-request/:id",
  // auth(ENUM_USER_ROLE.ADMIN),
  VendorController.acceptVendorRequest);

router.patch(
  '/advertise-declined/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.declinedVendor,
);

router.get(
  '/vendor-request-get-all',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.getAllPending,
);


export const VendorRoutes = router;
