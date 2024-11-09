import Stripe from 'stripe';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { Payment, Plan } from './payment.model';  
import { Packages } from '../dashboard/dashboard.model';
import { IPackages } from '../dashboard/dashboard.interface';
import Vendor from '../vendor/vendor.model';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const makePaymentIntent = async (payload: { amount: any }) => {

  const amount = Math.trunc(payload.amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  const data = {
    client_secret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
  };

  return data;
};


const paymentSuccessAndSave = async (payload: {
  amount: number;
  userId: string;
  transaction_id: string; 
  package_id: any;
}) => {

  const {userId} = payload;
  const requiredFields = ["amount", "userId", "transaction_id", "package_id"] as const;

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} field is required.`);
    }
  }

  const result = await Payment.create(payload); 
  const subscriptionPlan = await Packages.findById(payload.package_id) as IPackages;

  if (!subscriptionPlan) {
    throw new ApiError(404, "Subscription plan not found.");
  } 
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000);
 

  const plan = {
    userId: payload.userId, 
    packages_id: payload.package_id, 
    payment_id: result._id,
    featured_events : subscriptionPlan.featuredEvents,
    available_events:subscriptionPlan.eventsOrSpecials,
    active: true,
    start_date: startDate,
    end_date: endDate,
  } 
  const planCreate = await Plan.create(plan);
  if(!planCreate) {
    throw new ApiError(404, "Plan not created.");
  }

  const vendorUpdate = await Vendor.findByIdAndUpdate(userId , {
    package: payload.package_id,
    plan: planCreate._id,
    expiredDate: endDate
  }) as IPackages;

  if (!vendorUpdate) {
    throw new ApiError(404, "Vendor not found.");
  }

  return {  vendor: vendorUpdate, plan: planCreate };
};
export const PaymentService = { makePaymentIntent, paymentSuccessAndSave };
