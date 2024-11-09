import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;  
  }


  export interface IPackages extends Document {
    name: string;
    businessNameAndImage: boolean;  
    price: number;
    eventsOrSpecials: number;
    featuredEvents: number;
    contactInfoLocation: boolean;
    socialMediaWebsiteLink: boolean; 
    duration: number;
  }