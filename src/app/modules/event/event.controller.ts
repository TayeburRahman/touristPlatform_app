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
    .populate('vendor'); 

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

const getUserFavorites : RequestHandler = catchAsync( async (req: Request, res: Response) =>{
    const result = await EventService.getUserFavorites(req); 
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

 
 

export const EventController = {
    getEvents,
    createNewEvent,
    updateEvents,
    deleteEvents,
    retrieveEvent,
    approveEvents,
    saveUserClickEvent,
    getPopularMostEvents,
    getUserFavorites,
    getFeaturedEvents
}