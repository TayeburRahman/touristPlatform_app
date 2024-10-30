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
 


   

   
export const VendorRoutes = router;
