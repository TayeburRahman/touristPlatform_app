import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;  
  }