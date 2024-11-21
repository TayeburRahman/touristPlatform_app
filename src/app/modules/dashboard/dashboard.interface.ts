import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;  
  }

  export interface IBanner extends Document {
    banner_img: string;  
  }



  export interface IPackages extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    businessNameAndImage: boolean;  
    price: number;
    eventsOrSpecials: number;
    featuredEvents: number;
    contactInfoLocation: boolean;
    socialMediaWebsiteLink: boolean; 
    duration: number;
  }