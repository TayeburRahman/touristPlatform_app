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
router.patch(
    '/update/:eventId',
    auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN ),
    uploadFile(),
    EventController.updateEvents
);

router.get(
    '/get/:eventId',
    EventController.retrieveEvent
);
router.get(
    '/my-event',
    auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN ),
    EventController.getMyEvents
);
 

router.patch(
    '/duplicate-events/:eventId', 
    EventController.duplicateEvents,
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
    '/cancel/:id',
    auth(ENUM_USER_ROLE.ADMIN),
    EventController.declinedEvents,
); 

router.patch(
    '/save-click/:id',
    // auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
    EventController.saveUserClickEvent,
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

router.get(
    '/click-overview', 
    EventController.eventClickOverview,
); 
 


export const eventRoutes = router;
