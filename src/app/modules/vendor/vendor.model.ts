import mongoose, { Schema, Model, model } from 'mongoose'; 
import { ILocation,  IVendor, ISocialMedia, IAdvertise } from './vendor.interface';
import { boolean, string } from 'zod';
// Define the Location schema
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

// Define the Vendor schema
const VendorSchema = new Schema<IVendor>(
  { 
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User',
    }, 
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    vendor_name: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      default: null,
    }, 
    profile_image: {
      type: String,
      default: null,
    },  
    description: {
      type: String,
      default: null,
    },  
    social_media:{
      type: [socialMedia],
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    }, 
    location: {
      type: locationSchema,
    },
  },
  {
    timestamps: true,
  }
);



const AdvertiseSchema  = new Schema<IAdvertise>(
  {
    userId: {
      type: String, 
    }, 
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    business_name: {
      type: String,
      required: true,
    },
    massage: {
      type: String,
      required: true,
    },
    verify_code: {
      type: String, 
    }, 
    declined_text:{
      type: String,
    },
    otp_verify:{
      type: Boolean, 
      default: false,
    },
    status: {
       type: String,
       enum: ['pending', 'approved', 'declined'],
       default: 'pending',
    }, 
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);


// Create the Vendor model
 

// Create the Vendor model
const Vendor: Model<IVendor> = model<IVendor>('Vendor', VendorSchema); 
export default Vendor;
export const Advertise = model<IAdvertise>('Advertise', AdvertiseSchema);
