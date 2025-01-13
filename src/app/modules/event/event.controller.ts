import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { EventService } from "./event.service";
import Event from "./event.model";
import ApiError from "../../../errors/ApiError";

const getEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getEvents(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event retrieved successfully`,
        data: result,
    });
}) 

const getAllEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getAllEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event get Successfully!`,
        data: result,
    });
}) 

const getPopularMostEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getPopularMostEvents(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event retrieved successfully`,
        data: result,
    });
}) 

const createNewEvent : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.createNewEvent(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Created Successfully`,
        data: result,
    });
})

const createAdminNewEvent : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.createAdminNewEvent(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Created Successfully`,
        data: result,
    });
})


 

const updateEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.updateEvents(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Update Successfully`,
        data: result,
    });
})

const deleteEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.deleteEvents(req);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Delete Successfully!`,
        data: result,
    });
})

const approveEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.approveEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Approved Successfully!`,
        data: result,
    });
}) 

const retrieveEvent: RequestHandler = catchAsync(async (req: Request, res: Response) => {
    const eventId = req.params.eventId;  
    if (!eventId) {
        throw new ApiError(400, 'Event ID is required.');
    } 
    const event = await Event.findById(eventId)
    .populate('category')
    .populate({
        path: 'vendor',
        select: 'name profile_image email _id vendor', 
    });

    if (!event) {
        throw new ApiError(404, 'Event not found.');
    };
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Event retrieved successfully!',
        data: event,
    });
});

const saveUserClickEvent : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.saveUserClickEvent(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event Approved Successfully!`,
        data: result,
    });
})  

const getFeaturedEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getFeaturedEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event featured get Successfully!`,
        data: result,
    });
}) 


const getEventsByDate : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getEventsByDate(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event get Successfully!`,
        data: result,
    });
}) 


const getPastEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getPastEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event get Successfully!`,
        data: result,
    });
}) 

const getVendorEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getVendorEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event get Successfully!`,
        data: result,
    });
}) 

const getVendorFeatured : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getVendorFeatured(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event get Successfully!`,
        data: result,
    });
}) 

const declinedEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.declinedEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Cancel request successfully!`,
        data: result,
    });
}) 

const duplicateEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.duplicateEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Event duplicate successfully!`,
        data: result,
    });
})

const getMyEvents : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getMyEvents(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Get my event successfully!`,
        data: result,
    });
})

const eventClickOverview : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.eventClickOverview(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Get successfully!`,
        data: result,
    });
})


const updateFeatured : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const {result, massage} = await EventService.updateFeatured(req); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: massage,
        data: result,
    });
})


const getPastEventsByVendor : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result  = await EventService.getPastEventsByVendor(req.query.vendor as string); 
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'get past events successfully',
        data: result,
    })
})
 
 

 
 

export const EventController = {
    getEvents,
    getAllEvents,    
    createNewEvent,
    updateEvents,
    deleteEvents,
    retrieveEvent,
    approveEvents,
    saveUserClickEvent,
    getPopularMostEvents, 
    getFeaturedEvents,
    getEventsByDate,
    getPastEvents,
    getVendorEvents,
    getVendorFeatured,
    declinedEvents,
    duplicateEvents,
    getMyEvents,
    eventClickOverview,
    updateFeatured,
    getPastEventsByVendor,
    createAdminNewEvent
    
}