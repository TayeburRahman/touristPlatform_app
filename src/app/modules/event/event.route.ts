import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { EventController } from './event.controller';
import { uploadFile } from '../../middlewares/fileUploader';
const router = express.Router(); 

router.get( '/', EventController.getEvents);
router.get( '/admin', auth(ENUM_USER_ROLE.ADMIN), EventController.getAllEvents); 
router.get('/popular-events', EventController.getPopularMostEvents); 

router.post(
    '/create',
    auth(ENUM_USER_ROLE.VENDOR),
    uploadFile(),
    EventController.createNewEvent,
); 

router.get(
    '/user-favorites',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR),
    EventController.getUserFavorites,
);
 
router.patch(
    '/update/:eventId',
    auth(ENUM_USER_ROLE.VENDOR),
    uploadFile(),
    EventController.updateEvents
);

router.get(
    '/get/:eventId',
    EventController.retrieveEvent
);

router.get(
    '/featured_events',
    EventController.getFeaturedEvents
); 

router.delete(
    '/delete/:eventId',
    auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
    EventController.deleteEvents,
);

router.patch(
    '/approve/:id',
    auth(ENUM_USER_ROLE.ADMIN),
    EventController.approveEvents,
);

router.patch(
    '/save-click/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
    EventController.saveUserClickEvent,
);

router.get(
    '/favorites',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR),
    EventController.getUserFavorites,
);

router.get(
    '/events_by_date', 
    EventController.getEventsByDate,
);

router.get(
    '/events_by_past', 
    EventController.getPastEvents,
);

router.get(
    '/vendor-events/:vendorId', 
    EventController.getVendorEvents,
);
router.get(
    '/vendor-featured/:vendorId', 
    EventController.getVendorFeatured,
);



export const eventRoutes = router;
