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
  vendor_email: string;
  address?: string | null;
  phone_number?: string | null; 
  banner: string | null;
  vendor_name: string | null;
  profile_image: string | null;
  description: string | null; 
  status:'pending'| 'active'| 'declined' | 'deactivate';
  current_trip_user?: mongoose.Types.ObjectId;
  location?: ILocation;
  social_media: [ISocialMedia] | null;
  date_of_birth: string | null;
  amount: number | null;
  cover_image: string | null;
}


export interface IAdvertise extends Document {
  userId:mongoose.Types.ObjectId;
  authId: mongoose.Types.ObjectId;
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