import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync'; 
import { Category } from './dashboard.model';
import ApiError from '../../../errors/ApiError';
import { DashboardService } from './dashboard.services';

const createAndUpdateCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body 
    const id = req.query.id 

    let result;

     if(!data.name){
        throw new ApiError(200, 'Name is required');
     }
     if(!id){
        result = await Category.create(data); 
     }else{
        result = await Category.findByIdAndUpdate(id, data, { new: true });   
     }
  
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category Post Successfully!",
      data: result,
    });
  },
); 

const getCategory: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {  
      const result = await Category.find(); 
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Get Data Is Successfully!`,
        data: result,
      });
    },
  ); 

  const deleteCategory: RequestHandler = catchAsync(
    async (req: Request, res: Response) => { 
     const id = req.params.id;
     if(!id){
        throw new ApiError(200, 'Invalid ID, Id is required!');
     }
      const result = await Category.findByIdAndDelete(id); 
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Delete Data Is Successfully!`,
        data: result,
      });
    },
  ); 
// ----------------------------

const createPackages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.createPackages(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Create Packages Successfully!`,
      data: result,
    });
  },
); 

const updatePackages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.updatePackages(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Update Packages Successfully!`,
      data: result,
    });
  },
); 

const deletePackages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.deletePackages(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Delete Packages Successfully!`,
      data: result,
    });
  },
); 

const getPackages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.getPackages(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get Packages Successfully!`,
      data: result,
    });
  },
);  

const getPackagesDetails: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.getPackagesDetails(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get Package Successfully!`,
      data: result,
    });
  },
);   
// ---------------
const createBannerImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.createBannerImage(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Banner Create Successfully!`,
      data: result,
    });
  },
);  

const updateBannerImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.updateBannerImage(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Banner Update Successfully!`,
      data: result,
    });
  },
);  

const getBannerImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.getBannerImage(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Banner Get Successfully!`,
      data: result,
    });
  },
);  

const deleteBannerImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {   
    const result = await DashboardService.deleteBannerImage(req) 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Banner Delete Successfully!`,
      data: result,
    });
  },
); 
  
export const DashboardController = {
    createAndUpdateCategory, 
    getCategory,
    deleteCategory,
    createPackages,
    updatePackages,
    deletePackages,
    getPackages,
    getPackagesDetails,
    createBannerImage,
    updateBannerImage,
    getBannerImage,
    deleteBannerImage

};
