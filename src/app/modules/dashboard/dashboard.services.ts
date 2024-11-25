/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
// import Conversation from './conversation.model';
// import Message from './message.model';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
import { Banners, Packages } from './dashboard.model';
import { IBanner } from './dashboard.interface';
import Event from '../event/event.model';
import { IReqUser } from '../auth/auth.interface';
import { Plan } from '../payment/payment.model';
 

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
  const {userId} = req.user as IReqUser;  
  
  const packages = await Packages.find();
  const userPlan = await Plan.findOne({ userId, active: true }).sort({ createdAt: -1 });
  if (!packages) {
    throw new ApiError(404, 'Package not found.');
  }  

  return {packages, userplan: userPlan? userPlan?.packages_id: null};
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
const createBannerImage = async (req: Request) => { 
  const { banner_img } = req.files as {
    banner_img: Express.Multer.File[]
   };

  let images: string = ''
  if (banner_img && Array.isArray(banner_img)) {
  banner_img.map(file => 
   images = `/banner/${file.filename}`
   );
  } 

  const banner = await Banners.create({banner_img: images});
  return banner;
};

const updateBannerImage = async (req: Request) => { 
  const { id } = req.params; 
  const { banner_img } = req.files as {
    banner_img: Express.Multer.File[];
  };

  let images: string = '';
  if (banner_img && Array.isArray(banner_img)) {
    images = banner_img.map(file => `/banner/${file.filename}`).join(',');
  }

if (!images) {
  throw new Error('Banner image is required!');
}
 
const banner = await Banners.findById(id);

if (!banner) {
  throw new Error('Banner not found');
}
 
banner.banner_img = images;  
 
await banner.save();


  return banner;
};

const getBannerImage = async (req: Request) => {  
  const banner = await Banners.find(); 
  return banner;
};

const deleteBannerImage = async (req: Request) => {  
  const { id } = req.params;
  const banner = await Banners.findByIdAndDelete(id); 
  return banner;
};

// --Event------------------------- 

const countTotal = async (req: Request) => {}
 
const getEventOverview = async (req: Request) => {
  try {
    const { year } = req.query as { year: string };
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const now = new Date();
    const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
    const startOfLastYear = new Date(Date.UTC(selectedYear - 1, 0, 1));
    const endOfLastYear = new Date(Date.UTC(selectedYear, 0, 1));
    const startOfMonth = new Date(Date.UTC(selectedYear, now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(selectedYear, now.getUTCMonth() - 1, 1));
    const startOfToday = new Date(Date.UTC(selectedYear, now.getUTCMonth(), now.getUTCDate()));
    const startOfYesterday = new Date(Date.UTC(selectedYear, now.getUTCMonth(), now.getUTCDate() - 1));

    // Helper function to fetch event count
    const countEventsInRange = async (start: Date, end: Date) => {
      return Event.countDocuments({ date: { $gte: start, $lt: end } });
    };

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    };

    // Yearly growth
    const [eventsThisYear, eventsLastYear] = await Promise.all([
      countEventsInRange(startOfYear, now),
      countEventsInRange(startOfLastYear, endOfLastYear),
    ]);
    const yearlyGrowth = calculateGrowth(eventsThisYear, eventsLastYear);

    // Monthly growth
    const [eventsThisMonth, eventsLastMonth] = await Promise.all([
      countEventsInRange(startOfMonth, now),
      countEventsInRange(startOfLastMonth, startOfMonth),
    ]);
    const monthlyGrowth = calculateGrowth(eventsThisMonth, eventsLastMonth);

    // Daily growth
    const [eventsToday, eventsYesterday] = await Promise.all([
      countEventsInRange(startOfToday, now),
      countEventsInRange(startOfYesterday, startOfToday),
    ]);
    const dailyGrowth = calculateGrowth(eventsToday, eventsYesterday);

    // Monthly event aggregation
    const monthlyData = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lt: new Date(Date.UTC(selectedYear + 1, 0, 1)) },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalEvents: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          totalEvents: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Prepare monthly data result
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const eventOverview = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find((data: any) => data.month === i + 1) || {
        month: i + 1,
        totalEvents: 0,
      };
      return {
        month: months[i],
        totalEvents: monthData.totalEvents,
      };
    });

    // Return overview
    return {
      selectedYear,
      yearlyGrowth: yearlyGrowth.toFixed(2) + '%',
      monthlyGrowth: monthlyGrowth.toFixed(2) + '%',
      dailyGrowth: dailyGrowth.toFixed(2) + '%',
      eventOverview,
    };
  } catch (error: any) {
    console.error("Error fetching event overview:", error);
    throw new ApiError(500, "Internal Server Error");
  }
};






export const DashboardService = {
  updatePackages, 
  createPackages,
  deletePackages,
  getPackages,
  getPackagesDetails,
  createBannerImage,
  updateBannerImage,
  getBannerImage,
  deleteBannerImage,
  getEventOverview
};
