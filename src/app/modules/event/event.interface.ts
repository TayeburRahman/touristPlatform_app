import mongoose, { Document } from 'mongoose';
import { ILocation, ISocialMedia } from '../vendor/vendor.interface';

export interface IEvent extends Document {
  vendor: mongoose.Types.ObjectId;
  name: string;   
  date: Date;  
  time: string;  
  duration: string;
  option: string[];
  social_media: [ISocialMedia] | null;
  location: ILocation; 
  description?: string;  
  event_image: string[] | null;  
  status: 'pending' | 'approved' | 'declined';
  category:  mongoose.Types.ObjectId | null;
  favorites: number | null;  
  featured: Date | null;
  end_date: Date | null;
  address: string | null;
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly';
  recurrence_end: Date | null | string;
  active: boolean;
}

export interface IDate extends Document {
  date: Date;
}