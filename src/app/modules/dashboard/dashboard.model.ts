import mongoose, { Schema, Model, model } from 'mongoose';   
import { ICategory, IPackages } from './dashboard.interface';
 


const CategorySchema  = new Schema<ICategory>(
    {
      name: {
        type: String, 
        required: true,
        unique: true,
      },
    }, 
  );
 
  const PackagesSchema  = new Schema<IPackages>(
    {
      name: {
        type: String, 
        required: true,
        unique: true,
      },
      businessNameAndImage: {
        type: Boolean, 
        default: false, 
      },
      price: {
        type: Number, 
        required: true,
      },
      eventsOrSpecials: {
        type: Number,  
        default: 1
      },
      featuredEvents: {
        type: Number,  
        default: 0
      },
      contactInfoLocation: {
        type: Boolean, 
        default: false, 
      },
      socialMediaWebsiteLink: {
        type: Boolean, 
        default: false, 
      },
      duration: {
        type: Number,
        default: 30,
      },
    }, 
  );

export const Packages = model<IPackages>('Packages', PackagesSchema);
export const Category = model<ICategory>('Category', CategorySchema);
