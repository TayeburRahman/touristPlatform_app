import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

// -----Category--------------------------------
router.post(
    '/category',
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.createAndUpdateCategory,
);
router.get(
    '/get-category',
    DashboardController.getCategory,
);
router.delete(
    '/delete-category/:id',
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.deleteCategory,
)

// ----------------------------- 
// router.post(
//     '/vendor',
//     auth(ENUM_USER_ROLE.ADMIN),
//     uploadFile,
//     DashboardController.createAndUpdateVendor,
// );




export const DashboardRoutes = router;
