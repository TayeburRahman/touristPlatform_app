import mongoose, { Schema, Model, model } from 'mongoose';   
import { ICategory } from './dashboard.interface';
 


const CategorySchema  = new Schema<ICategory>(
    {
      name: {
        type: String, 
        required: true,
        unique: true,
      },
    }, 
  );


 
export const Category = model<ICategory>('Category', CategorySchema);
