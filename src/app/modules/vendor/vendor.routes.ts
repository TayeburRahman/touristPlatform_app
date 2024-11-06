import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { VendorController } from './vendor.controller';

const router = express.Router();

router.post(
  '/advertise-us-from',
  VendorController.createAdvertiseUsFrom,
);
router.get(
  '/advertise-request-get-all',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.getPaddingRequest,
);
router.patch(
  '/advertise-approve/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.approveAdvertise,
);
router.patch(
  '/advertise-declined/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.declinedAdvertise,
);

// ---------------
router.patch("/accept-request/:id",
  // auth(ENUM_USER_ROLE.ADMIN),
  VendorController.acceptVendorRequest);
router.patch(
  '/vendor-delete/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.deleteVendorRequest,
);
router.get(
  '/vendor-request-get-all',
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.getAllPending,
);


export const VendorRoutes = router;
