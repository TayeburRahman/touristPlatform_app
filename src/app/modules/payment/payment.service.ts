import Stripe from 'stripe';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { Payment, Plan } from './payment.model';
import { IPackages } from '../dashboard/dashboard.interface';
import Vendor from '../vendor/vendor.model';
import { IReqUser } from '../auth/auth.interface';
import { Request } from 'express';
import { Packages } from '../dashboard/dashboard.model';
import httpStatus from 'http-status';
import { IVendor } from '../vendor/vendor.interface';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const CLIENT_DOMAIN_URL = config.client_domain_url
const endpointSecret = config.stripe.stripe_webhook_secret;

const createCheckoutSession = async (req: Request) => {
  try {
    const { packageId } = req.query as {
      packageId: string;
      listingId: string;
    }

    const { userId } = req.user as IReqUser;
    const vendor = await Vendor.findById(userId) as IVendor;

    if (!vendor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found. Please try again later!');
    }

    const packageData = await Packages.findById(packageId) as IPackages;

    if (!packageData) {
      throw new ApiError(httpStatus.NOT_FOUND, 'invalid package ID.');
    }

    const packagePrice = Number(packageData.price);
    const unitAmount = packagePrice * 100;

    let session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${CLIENT_DOMAIN_URL}/payment?success=true`,
      cancel_url: `${CLIENT_DOMAIN_URL}/payment?canceled=true`,
      customer_email: `${vendor.email}`,
      client_reference_id: userId,
      metadata: { packageId: packageData._id.toString() },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: packageData.name,
              description: `Price: ${packageData.price}`
            }
          },
          quantity: 1
        }
      ]
    })

    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    return {
      url: session?.url,
      session
    };

  } catch (error: any) {
    throw new ApiError(400, error.message);
  }
};

const checkAndUpdateStatusByWebhook = async (req: any) => {
  const body = req.body;
  let event;

  if (!endpointSecret) {
    throw new ApiError(500, 'Missing Stripe Webhook Secret.');
  }
  const signature = req.headers['stripe-signature'];
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  if (event.type === 'checkout.session.completed') {
    const session: any = event.data.object;
    const userId = session.client_reference_id;
    const transaction_id = session.payment_intent;
    const package_id = session.metadata.packageId;
    const currency = session.currency;
    const stripeAmount = session.amount_total;
    const amount = Number(Number(stripeAmount) / 100);

    // console.log("amount", amount)

    const requiredFields = ["amount", "userId", "transaction_id", "package_id", "currency"] as const;

    const payload = {
      amount,
      userId,
      transaction_id,
      package_id,
      currency
    };

    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new ApiError(400, `${field} field is required.`);
      }
    }

    const result = await Payment.create(payload);
    console.log('result', result);
    const subscriptionPlan = await Packages.findById(package_id) as IPackages;



    if (!subscriptionPlan) {
      throw new ApiError(404, "Subscription plan not found.");
    }
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000);

    const plan = {
      userId: userId,
      packages_id: package_id,
      payment_id: result._id,
      featured_events: subscriptionPlan.featuredEvents,
      available_events: subscriptionPlan.eventsOrSpecials,
      active: true,
      start_date: startDate,
      end_date: endDate,
      amount: amount,
    }

    const planCreate = await Plan.create(plan);
    if (!planCreate) {
      throw new ApiError(404, "Plan not created.");
    }

    const vendorUpdate = await Vendor.findByIdAndUpdate(userId, {
      package: package_id,
      plan: planCreate._id,
      expiredDate: endDate
    }) as IPackages;

    if (!vendorUpdate) {
      throw new ApiError(404, "Vendor not found.");
    }
    return;
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }
};

const paymentSuccessAndSave = async (payload: {
  amount: number;
  userId: string;
  transaction_id: string;
  package_id: any;
}) => {
  const { userId } = payload;
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
    featured_events: subscriptionPlan.featuredEvents,
    available_events: subscriptionPlan.eventsOrSpecials,
    active: true,
    start_date: startDate,
    end_date: endDate,
  }
  const planCreate = await Plan.create(plan);
  if (!planCreate) {
    throw new ApiError(404, "Plan not created.");
  }

  const vendorUpdate = await Vendor.findByIdAndUpdate(userId, {
    package: payload.package_id,
    plan: planCreate._id,
    expiredDate: endDate
  }) as IPackages;

  if (!vendorUpdate) {
    throw new ApiError(404, "Vendor not found.");
  }

  return { vendor: vendorUpdate, plan: planCreate };
};

const userPlanHistory = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const plans = await Plan.find({ userId })
    .populate({
      path: 'packages_id',
      select: 'name',
    });

  return plans;
};

export const PaymentService = {
  createCheckoutSession,
  checkAndUpdateStatusByWebhook,
  userPlanHistory,
  paymentSuccessAndSave
};
