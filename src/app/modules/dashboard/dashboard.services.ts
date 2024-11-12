/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
// import Conversation from './conversation.model';
// import Message from './message.model';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
import { Banners, Packages } from './dashboard.model';
import { IBanner } from './dashboard.interface';
 

const createPackages = async (req: Request) => { 
  const data = req.body; 
  const packages = await Packages.create(data)  
  return packages;
}; 

const updatePackages = async (req: Request) => {
  const { id } = req.params; 
  const data = req.body;    
 
  const updatedPackage = await Packages.findByIdAndUpdate(id, data, { new: true });
 
  if (!updatedPackage) {
    throw new ApiError(404, 'Package not found.');
  }

  return updatedPackage;
}; 

const deletePackages = async (req: Request) => {
  const { id } = req.params;  
  const deletedPackage = await Packages.findByIdAndDelete(id);
 
  if (!deletedPackage) {
    throw new ApiError(404, 'Package not found.');
  } 
  return deletedPackage;
};

const getPackages = async (req: Request) => { 
  const packages = await Packages.find();
 
  if (!packages) {
    throw new ApiError(404, 'Package not found.');
  } 
  return packages;
};

const getPackagesDetails = async (req: Request) => { 
  const { id } = req.params;
  const packages = await Packages.findById(id);
 
  if (!packages) {
    throw new ApiError(404, 'Package not found.');
  } 
  return packages;
};

// --------------------------------
const createBannerImage = async (req: Request) => { 

  const { banner_img } = req.files as {
    banner_img: Express.Multer.File[]
};

 let images: string = ''
if (banner_img && Array.isArray(banner_img)) {
  banner_img.map(file => 
   images = `/banner/${file.filename}`
  );
} 
 const banner = await Banners.create({banner_img: images});
  return banner;
};

const updateBannerImage = async (req: Request) => { 
  const { id } = req.params; 
  const { banner_img } = req.files as {
    banner_img: Express.Multer.File[];
  };

  let images: string = '';
  if (banner_img && Array.isArray(banner_img)) {
    images = banner_img.map(file => `/banner/${file.filename}`).join(',');
  }

if (!images) {
  throw new Error('Banner image is required!');
}
 
const banner = await Banners.findById(id);

if (!banner) {
  throw new Error('Banner not found');
}
 
banner.banner_img = images;  
 
await banner.save();


  return banner;
};

const getBannerImage = async (req: Request) => {  
  const banner = await Banners.find(); 
  return banner;
};

const deleteBannerImage = async (req: Request) => {  
  const { id } = req.params;
  const banner = await Banners.findByIdAndDelete(id); 
  return banner;
};

export const DashboardService = {
  updatePackages, 
  createPackages,
  deletePackages,
  getPackages,
  getPackagesDetails,
  createBannerImage,
  updateBannerImage,
  getBannerImage,
  deleteBannerImage
};
