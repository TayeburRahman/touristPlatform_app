import mongoose, { Document } from 'mongoose';
import { ILocation, ISocialMedia } from '../vendor/vendor.interface';

export interface IEvent extends Document {
  vendor: mongoose.Types.ObjectId;
  name: string;   
  date: string;  
  time: string;  
  duration: string;
  option: string;
  social_media: [ISocialMedia] | null;
  location: ILocation; 
  description?: string;  
  event_image: string[] | null;  
  status: 'pending' | 'approved' | 'declined';
  category:  mongoose.Types.ObjectId | null;
  
}