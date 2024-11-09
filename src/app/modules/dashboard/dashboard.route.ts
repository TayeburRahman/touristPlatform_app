import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

// -----Category-------------------
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

// -----Packages------------------------ 
router.post(
    '/create_packages',
    auth(ENUM_USER_ROLE.ADMIN), 
    DashboardController.createPackages
);
router.patch(
    '/update_packages/:id',
    auth(ENUM_USER_ROLE.ADMIN), 
    DashboardController.updatePackages
);
router.delete(
    '/delete_packages/:id',
    auth(ENUM_USER_ROLE.ADMIN), 
    DashboardController.deletePackages
);
router.get(
    '/get_packages', 
    DashboardController.getPackages
);
router.get(
    '/package/:id', 
    DashboardController.getPackagesDetails
);

// --------------------------


export const DashboardRoutes = router;
