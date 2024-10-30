import mongoose, { Document } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: number[];
}

export interface ISocialMedia {
  name: string;
  link: string;
}


export interface IVendor extends Document {
  authId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  address?: string | null;
  phone_number?: string | null; 
  banner: string | null;
  vendor_name: string | null;
  profile_image: string | null;
  description: string | null; 
  status?: 'pending' | 'approved' | 'declined';
  current_trip_user?: mongoose.Types.ObjectId;
  location?: ILocation;
  social_media: [ISocialMedia] | null;
}


export interface IAdvertise extends Document {
  userId?: string;  
  name: string;
  phone?: string;  
  email: string;
  business_name: string;
  massage: string; 
  verify_code?: string;  
  declined_text?: string;  
  status: 'pending' | 'approved' | 'declined';  
  otp_verify: boolean
}