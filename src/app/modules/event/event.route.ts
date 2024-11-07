import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { EventController } from './event.controller';
import { uploadFile } from '../../middlewares/fileUploader';
const router = express.Router();

router.post(
    '/create',
    auth(ENUM_USER_ROLE.VENDOR),
    uploadFile(),
    EventController.createNewEvent,
);

router.patch(
    '/update/:eventId',
    auth(ENUM_USER_ROLE.VENDOR),
    uploadFile(),
    EventController.updateEvents,
);

router.get(
    '/get/:eventId',
    EventController.retrieveEvent,
);

router.delete(
    '/delete/:id',
    auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
    EventController.deleteEvents,
);

router.patch(
    '/approve/:id',
    auth(ENUM_USER_ROLE.ADMIN),
    EventController.approveEvents,
);

router.patch(
    '/favorites/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
    EventController.favoritesAddEvent,
);

router.get(
    '/favorites',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR),
    EventController.getUserFavorites,
);

 


export const eventRoutes = router;
