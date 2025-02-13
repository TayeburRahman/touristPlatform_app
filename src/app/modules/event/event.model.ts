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
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  option: {
    type: [String],
  },
  social_media: {
    type: String,
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
  spanishDescription: {
    type: String,
    default: null
  },
  event_image: {
    type: [String],
    default: null
  },
  featured: {
    type: Date,
    default: null
  },
  favorites: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'updated', 'approved', 'declined'],
    default: 'pending'
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none',
  },
  recurrence_end: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;
