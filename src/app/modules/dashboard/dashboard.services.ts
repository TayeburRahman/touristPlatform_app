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
// const getEventOverview = async (req: Request) => {
//   try {
//     const { year } = req.query as {
//       year: string;
//     }
//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();

//     // Fetch all events for calculations
//     const events = await Event.find();

//     // Helper function to filter events by date range
//     const filterEventsByDateRange = (startDate : any, endDate: any) => {
//       return events.filter(event => {
//         const eventDate = new Date(event.date);
//         return eventDate >= startDate && eventDate < endDate;
//       });
//     };

//     // Yearly growth
//     const startOfThisYear = new Date(selectedYear, 0, 1);
//     const startOfLastYear = new Date(selectedYear - 1, 0, 1);
//     const endOfLastYear = new Date(selectedYear, 0, 1);
//     const eventsThisYear = filterEventsByDateRange(startOfThisYear, new Date());
//     const eventsLastYear = filterEventsByDateRange(startOfLastYear, endOfLastYear);
//     const yearlyGrowth = eventsLastYear.length
//       ? ((eventsThisYear.length - eventsLastYear.length) / eventsLastYear.length) * 100
//       : 0;

//     // Monthly growth (current month vs previous month in the selected year)
//     const now = new Date();
//     const startOfThisMonth = new Date(selectedYear, now.getMonth(), 1);
//     const startOfLastMonth = new Date(selectedYear, now.getMonth() - 1, 1);
//     const endOfLastMonth = new Date(selectedYear, now.getMonth(), 1);
//     const eventsThisMonth = filterEventsByDateRange(startOfThisMonth, new Date());
//     const eventsLastMonth = filterEventsByDateRange(startOfLastMonth, endOfLastMonth);
//     const monthlyGrowth = eventsLastMonth.length
//       ? ((eventsThisMonth.length - eventsLastMonth.length) / eventsLastMonth.length) * 100
//       : 0;

//     // Daily growth (today vs yesterday in the selected year)
//     const startOfToday = new Date(selectedYear, now.getMonth(), now.getDate());
//     const startOfYesterday = new Date(selectedYear, now.getMonth(), now.getDate() - 1);
//     const endOfYesterday = startOfToday;
//     const eventsToday = filterEventsByDateRange(startOfToday, new Date());
//     const eventsYesterday = filterEventsByDateRange(startOfYesterday, endOfYesterday);
//     const dailyGrowth = eventsYesterday.length
//       ? ((eventsToday.length - eventsYesterday.length) / eventsYesterday.length) * 100
//       : 0;

//     // Monthly data for each month
//     const monthlyData = Array.from({ length: 12 }, (_, month) => {
//       const startOfMonth = new Date(selectedYear, month, 1);
//       const endOfMonth = new Date(selectedYear, month + 1, 1);
//       const eventsInMonth = filterEventsByDateRange(startOfMonth, endOfMonth);
//       return eventsInMonth.length;
//     });

//     // Send response with growth overview and monthly data
//     return {
//       selectedYear,
//       yearlyGrowth: yearlyGrowth.toFixed(2) + '%',
//       monthlyGrowth: monthlyGrowth.toFixed(2) + '%',
//       dailyGrowth: dailyGrowth.toFixed(2) + '%',
//     };
//   } catch (error : any) {
//     console.error(error);
//     throw new ApiError(404,'Server error:', error);
//   }
// };


const getEventOverview = async (req: Request) => {
  try {
    const { year } = req.query as {
      year: string;
    }
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // Fetch all events for calculations
    const events = await Event.find();

    // Helper function to filter events by date range
    const filterEventsByDateRange = (startDate: any, endDate : any) => {
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate < endDate;
      });
    };

    // Yearly growth
    const startOfThisYear = new Date(selectedYear, 0, 1);
    const startOfLastYear = new Date(selectedYear - 1, 0, 1);
    const endOfLastYear = new Date(selectedYear, 0, 1);
    const eventsThisYear = filterEventsByDateRange(startOfThisYear, new Date());
    const eventsLastYear = filterEventsByDateRange(startOfLastYear, endOfLastYear);
    const yearlyGrowth = eventsLastYear.length
      ? ((eventsThisYear.length - eventsLastYear.length) / eventsLastYear.length) * 100
      : 0;

    // Monthly growth (current month vs previous month in the selected year)
    const now = new Date();
    const startOfThisMonth = new Date(selectedYear, now.getMonth(), 1);
    const startOfLastMonth = new Date(selectedYear, now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(selectedYear, now.getMonth(), 1);
    const eventsThisMonth = filterEventsByDateRange(startOfThisMonth, new Date());
    const eventsLastMonth = filterEventsByDateRange(startOfLastMonth, endOfLastMonth);
    const monthlyGrowth = eventsLastMonth.length
      ? ((eventsThisMonth.length - eventsLastMonth.length) / eventsLastMonth.length) * 100
      : 0;

    // Daily growth (today vs yesterday in the selected year)
    const startOfToday = new Date(selectedYear, now.getMonth(), now.getDate());
    const startOfYesterday = new Date(selectedYear, now.getMonth(), now.getDate() - 1);
    const endOfYesterday = startOfToday;
    const eventsToday = filterEventsByDateRange(startOfToday, new Date());
    const eventsYesterday = filterEventsByDateRange(startOfYesterday, endOfYesterday);
    const dailyGrowth = eventsYesterday.length
      ? ((eventsToday.length - eventsYesterday.length) / eventsYesterday.length) * 100
      : 0;

    // Monthly data for each month
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const startOfMonth = new Date(selectedYear, month, 1);
      const endOfMonth = new Date(selectedYear, month + 1, 1);
      const eventsInMonth = filterEventsByDateRange(startOfMonth, endOfMonth);
      return eventsInMonth.length;
    });

    // Send response with growth overview and monthly data
   return {
      selectedYear,
      yearlyGrowth: yearlyGrowth.toFixed(2) + '%',
      monthlyGrowth: monthlyGrowth.toFixed(2) + '%',
      dailyGrowth: dailyGrowth.toFixed(2) + '%',
      monthlyData,
    };
  } catch (error: any) {
    console.error(error);
    throw new ApiError(404,'Server error:', error);
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
