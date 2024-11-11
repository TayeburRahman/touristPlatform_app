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
    amount: Number,
    transaction_id: String,
    note: String,
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
      ref: 'Events',
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