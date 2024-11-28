import mongoose, { Schema, Model, model } from 'mongoose';   
import { IBanner, ICategory, IPackages } from './dashboard.interface';
 


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


  
const BannerSchema  = new Schema<IBanner>(
  {
    banner_img: {
      type: String, 
      required: true, 
    },
  }, 
);

const eventClickOverview   = new Schema<{
  eventId:  Schema.Types.ObjectId,
}>(
  {
    eventId: {
      type: Schema.Types.ObjectId, 
      ref: 'Event',
      required: true,

    },
  }, {
    timestamps: true  
  }
);

export const ClickOverview = model<{
  eventId:  Schema.Types.ObjectId,
}>('Overview', eventClickOverview);

export const Banners = model<IBanner>('Banners', BannerSchema);
export const Packages = model<IPackages>('Packages', PackagesSchema);
export const Category = model<ICategory>('Category', CategorySchema);
