import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync'; 
import { Category } from './dashboard.model';
import ApiError from '../../../errors/ApiError';

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

export const DashboardController = {
    createAndUpdateCategory, 
    getCategory,
    deleteCategory

};
