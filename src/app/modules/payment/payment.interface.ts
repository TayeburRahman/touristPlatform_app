import { Schema } from 'mongoose';

export type IPayment = {
  payment_method: string; 
  package_id: Schema.Types.ObjectId;
  amount: number;
  transaction_id: string;
  note: string;
  vendor: Schema.Types.ObjectId;
};

export type IPlan = {
  userId: Schema.Types.ObjectId;
  payment_id: Schema.Types.ObjectId;
  packages_id: Schema.Types.ObjectId;
  events: Schema.Types.ObjectId[];
  featured_events: number;
  available_events: number;
  start_date: Date;
  end_date: Date;
  active: boolean;
}; 

 