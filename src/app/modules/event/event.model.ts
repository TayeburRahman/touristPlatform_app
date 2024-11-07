import mongoose, { Document, Model, Schema } from "mongoose";
import { IEvent } from "./event.interface"; 
import { ILocation, ISocialMedia } from "../vendor/vendor.interface";
 

const locationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const socialMedia = new Schema<ISocialMedia>({
  name: {
    type: String,  
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

const eventSchema = new Schema<IEvent>({ 
  vendor: {
    type: Schema.Types.ObjectId, 
    ref: 'Vendor',
    required: true,
  },
  name: { 
    type: String, 
    required: true 
  }, 
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true 
  },
  category: { 
    type:  Schema.Types.ObjectId,
     ref: 'Category',
     required: true,
  },
  option: { 
    type: String, 
    required: true 
  },
  social_media: { 
    type: [socialMedia], 
    default: null 
  },
  location: { 
    type: locationSchema, 
    required: true 
  },
  description: {
    type: String, 
    default: null 
  },
  event_image: { 
    type: [String], 
    default: null 
  },
  favorites: { 
    type: [String], 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined'], 
    default: 'pending' 
  }
}, {
  timestamps: true  
});

const Event = mongoose.model<IEvent>('Event', eventSchema);


export default Event;
