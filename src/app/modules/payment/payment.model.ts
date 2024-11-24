import { Schema, model } from 'mongoose';
import { IPayment, IPlan } from './payment.interface';
import { date } from 'zod';

const paymentSchema = new Schema<IPayment>(
  {
    payment_method: String,
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    package_id: {
      type: Schema.Types.ObjectId,
      ref: 'Packages',
    },
    currency: {
      type: String,
      default: 'usd',
    },
    amount: {
      type: Number, 
    },
    transaction_id: {
      type: String, 
    },
    note: {
     type: String,
     default:"Payment for purchase package in web transaction"
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const planSchema = new Schema<IPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    payment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    packages_id: {
      type: Schema.Types.ObjectId,
      ref: 'Packages',
    },
    events: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'Event',
    },
    featured_events: {
      type: Number
    },
    available_events: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: false,
    },
    amount:{
      type: Number
    },
    start_date: Date,
    end_date: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Payment = model('Payment', paymentSchema);
export const Plan = model('Plan', planSchema);