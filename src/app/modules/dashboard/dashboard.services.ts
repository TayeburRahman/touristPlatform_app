/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
// import Conversation from './conversation.model';
// import Message from './message.model';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
import { Packages } from './dashboard.model';
 

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
export const DashboardService = {
  updatePackages, 
  createPackages,
  deletePackages,
  getPackages,
  getPackagesDetails
};
