import { Request } from "express";
import ApiError from "../../../errors/ApiError";
import { IEvent } from "./event.interface";
import Event from "./event.model";
import { IReqUser } from "../auth/auth.interface";

const createNewEvent = async (req: Request) => {
    const { userId, authId } = req.user as IReqUser;

    const { event_image } = req.files as {
        event_image: Express.Multer.File[];
    };
    
    const { name, date, time, duration, option,
        //  social_media, 
         longitude, latitude, description, image, category } = req.body as any;

     const data = req.body 

    const social_media = [
        {
          "name": "Facebook",
          "link": "https://facebook.com/annual-charity-event"
        },
        {
          "name": "Instagram",
          "link": "https://instagram.com/annual-charity-event"
        }
      ]
        
    const requiredFields = [
        "name",
        "date",
        "time",
        "duration",
        "option",
        "longitude",
        "latitude", 
        "category"
      ];
  
      // Validate required fields
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new ApiError(400, `${field} is required.`);
        }
      } 
 
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
        throw new ApiError(400, 'Invalid date format.');
    } 

    const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
    };

    let images: any = [];  
    if (event_image && Array.isArray(event_image)) { 
      images = event_image.map(file => `/images/events/${file.filename}`);
    }
 
    const newEvent = await Event.create({
        vendor: userId,
        name,
        date: eventDate,  
        time,
        duration,
        option,
        social_media,
        location,
        description,
        category,
        event_image: images,
    });

    if (!newEvent) {
        throw new ApiError(500, 'Failed to create event.');
    }

    return newEvent;
} 
const updateEvents = async (req: Request) => {
    const { userId } = req.user as IReqUser;
    const { eventId } = req.params;
    const { event_image } = req.files as {
        event_image: Express.Multer.File[]
    };

    const { name, date, time, duration, option, social_media, longitude, latitude, description, category } = req.body as any;
 
    let images: any = [];  
    if (event_image && Array.isArray(event_image)) { 
      images = event_image.map(file => `/images/events/${file.filename}`);
    } 
    const existingEvent = await Event.findOne({ _id: eventId }) as any;
    if (!existingEvent) {
        throw new ApiError(404, 'Event not found or unauthorized.');
    }
    if (name) existingEvent.name = name;
    if (date) {
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
            throw new ApiError(400, 'Invalid date format.');
        }
        existingEvent.date = eventDate;  
    }
    if (time) existingEvent.time = time;
    if (category) existingEvent.category = category;
    if (duration) existingEvent.duration = duration;
    if (option) existingEvent.option = option;
    if (social_media) existingEvent.social_media = social_media;   
    if (longitude && latitude) {
        existingEvent.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };
    }
    if (description) existingEvent.description = description;
    if (images?.length) existingEvent.event_image = images;

    try { 
        const updatedEvent = await existingEvent.save();
        return updatedEvent;
    } catch (error) {
        console.error("Error updating event:", error);
        throw new ApiError(500, 'Failed to update event.');
    }
}
const deleteEvents = async (req: Request) => {
    const { userId, authId } = req.user as IReqUser; 
    const id = req.params.id;

    const existingEvent = await Event.findById(id);

    if(!existingEvent){
        throw new ApiError(404, 'Event not found or unauthorized.');
    } 
    const deleteEvent = await Event.findByIdAndDelete(id)  
    return deleteEvent;
}
const approveEvents = async (req: Request) => {
    const id = req.params.id;
    const result = await Event.findByIdAndUpdate(id, {status: 'approved'});
    if(!result){
        throw new ApiError(404, 'Event not found.');
    }  
    return result;
}

// -------------
const favoritesAddEvent = async (req: Request) => {
    const { userId, authId } = req.user as IReqUser;  // userId and authId are used to check and update
    const eventId = req.params.id;  // eventId from params


    console.log("authId", authId)
 
    // Find the existing event by its ID
    const existingEvent: any = await Event.findById(eventId);  

    if (!existingEvent) {
        throw new ApiError(404, 'Event not found or unauthorized.');
    }

     const isFavorite = existingEvent.favorites?.includes(authId);

    let result;

    if (isFavorite) { 
        
        result = await Event.findByIdAndUpdate(
            eventId,
            { $pull: { favorites: authId } },  
            { new: true }   
        );
    } else {  
        result = await Event.findByIdAndUpdate(
            eventId,
            { $addToSet: { favorites: authId } },  
            { new: true }  
        );
    } 
    return result;
};


const getUserFavorites = async (req: Request) => {
    const { authId } = req.user as IReqUser; 
 
    const favoriteEvents = await Event.find({ favorites: authId });
 
    if (!favoriteEvents || favoriteEvents.length === 0) {
        return { message: 'No favorite events found.' };
    }

    return favoriteEvents;  
};


 

export const EventService = {
    createNewEvent,
    updateEvents,
    deleteEvents,
    approveEvents,
    favoritesAddEvent,
    getUserFavorites
};