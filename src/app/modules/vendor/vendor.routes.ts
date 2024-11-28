import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { VendorController } from './vendor.controller';

const router = express.Router();

router.post("/register", 
  uploadFile(),
  VendorController.vendorRegister);

router.patch("/send-vendor-request",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  VendorController.vendorRequest);
  router.patch('/update', 
    uploadFile(),
    auth(ENUM_USER_ROLE.VENDOR),
    VendorController.updateProfile,
  );

// -----Admin -------------
router.get("/get-all-vendor-request",
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.getAllPending);

router.patch("/accept-request/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.acceptVendorRequest);

// router.delete(
//   '/declined/:id',
//   auth(ENUM_USER_ROLE.ADMIN),
//   VendorController.declinedVendor,
// ); 

router.get(
  '/get-details/:id', 
  VendorController.getVendorProfileDetails,
); 
router.get("/get-all-vendor",
  auth(ENUM_USER_ROLE.ADMIN),
  VendorController.getAllVendor);

  router.patch("/status",
    auth(ENUM_USER_ROLE.ADMIN),
    VendorController.updateVendorStatus);
   

 


export const VendorRoutes = router;
