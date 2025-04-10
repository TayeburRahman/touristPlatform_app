import { Request } from "express";
import ApiError from "../../../errors/ApiError";
import Event from "./event.model";
import { IReqUser } from "../auth/auth.interface";
import { Plan } from "../payment/payment.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import { IEvent } from "./event.interface";
import { sendResetEmail } from "../auth/sendResetMails";
import { logger } from "../../../shared/logger";
import cron from "node-cron";
import { EventDate } from "./event.helper";
import { ClickOverview } from "../dashboard/dashboard.model";
import { DateTime } from "luxon";

// cron.schedule("*/5 * * * *", async () => {
//     try {
//         const dates = new Date();
//         dates.setHours(dates.getHours() - 6);
//         console.log("=========", dates.toISOString());

//         const result = await Event.updateMany(
//             {
//                 active: true,
//                 end_date: { $lte: dates.toISOString() },
//             },
//             {
//                 $set: { active: false },
//             }
//         );
//         console.log("=================================================l")
//         if (result.modifiedCount > 0) {
//             logger.info(`Set ${result.modifiedCount} inactive events.`);
//         }
//     } catch (error) {
//         logger.error("Error setting events to inactive:", error);
//     }
// });


cron.schedule("*/1 * * * *", async () => {
    try {
        const dates = new Date();
        dates.setHours(dates.getHours() - 6);
        console.log("=========", dates.toISOString());

        // Create a new date for targetDate and set it to midnight
        const targetDate = new Date(dates);  // Clone the original date object
        targetDate.setHours(0, 0, 0, 0);  // Set the time to midnight for date-only comparison

        const currentTime = new Date(dates);  // Create a new date object for the current time comparison
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;  // Convert to 12-hour format
        const formattedTime = `${hours12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`; // Format like '06:00 PM'

        console.log("Formatted current time:", formattedTime);

        // Function to convert time string to 24-hour format for Date object comparison
        const convertTo24Hr = (timeStr: any) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            if (modifier === 'PM' && hours !== 12) hours += 12; // Convert PM times to 24-hour format
            if (modifier === 'AM' && hours === 12) hours = 0;  // Convert 12 AM to 0 hours
            const timeDate = new Date(targetDate);  // Clone targetDate so the original date isn't modified
            timeDate.setHours(hours, minutes, 0, 0);  // Set the time on the cloned date object
            return timeDate;
        };

        const targetEndTimeObj = convertTo24Hr(formattedTime);  // Convert formatted time to Date object

        console.log("=========", targetDate, targetEndTimeObj);

        const result = await Event.updateMany(
            {
                active: true,
                end_date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 86400000) },  // Match end_date today
                end_time: { $lte: targetEndTimeObj.toISOString() },  // Match end_time <= current time
            },
            {
                $set: { active: false },  // Set active to false and end_time to false
            }
        );

        if (result.modifiedCount > 0) {
            logger.info(`Set ${result.modifiedCount} events to inactive and updated end_time.`);
        } else {
            logger.info("No events were modified.");
        }

    } catch (error) {
        logger.error("Error setting events to inactive:", error);
    }
});




cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const result = await Event.updateMany(
            {
                active: false,
                end_date: { $gt: now },
            },
            {
                $set: { active: true },
            }
        );

        if (result.modifiedCount > 0) {
            logger.info(`Set ${result.modifiedCount} inactive events.`);
        }
    } catch (error) {
        logger.error("Error setting event active:", error);
    }
});

cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const events = await Event.find({
            active: false,
            recurrence_end: { $gt: now },
        }).exec();

        if (events.length > 0) {
            for (const event of events) {
                let newEvent = event.toObject();
                const currentDate = event.date;
                const endDate = event.date;
                //   console.log("currentDate",currentDate)
                switch (event.recurrence) {
                    case "weekly":
                        newEvent.date = EventDate.getNextWeek(currentDate);
                        newEvent.end_date = EventDate.getNextWeek(endDate);
                        break;
                    case "monthly":
                        newEvent.date = EventDate.getNextMonth(currentDate);
                        newEvent.end_date = EventDate.getNextMonth(endDate);
                        break;
                    case "yearly":
                        newEvent.date = EventDate.getNextYear(currentDate);
                        newEvent.end_date = EventDate.getNextYear(endDate);
                        break;
                    case "daily":
                        newEvent.date = EventDate.getNextDay(currentDate);
                        newEvent.end_date = EventDate.getNextDay(endDate);
                        break;
                    default:
                        continue;
                }
                newEvent.active = true; // Reactivate event
                await Event.findByIdAndUpdate(event._id, newEvent, { new: true });
            }
            logger.info(`Set ${events.length} active events from recurring events.`);
        }
    } catch (error) {
        logger.error("Error setting event active:", error);
    }
});

const createNewEvent = async (req: Request) => {
    const { userId, authId, role } = req.user as IReqUser;
    const { event_image } = req.files as { event_image: Express.Multer.File[] };
    const { name, date, time, featured,
        social_media,
        end_date,
        address,
        duration, option, longitude, latitude, description, recurrence, category, recurrence_end, spanishDescription } = req.body as any;

    // console.log("=a=recurrence_end=", recurrence_end)
    // console.log("=a=end_date=", end_date)
    // console.log("=a=date=", date)
    // console.log("=a=featured=", featured)

    const data = req.body;

    const requiredFields = [
        "name",
        "date",
        "time",
        "longitude",
        "latitude",
        "category",
        "end_date",
        "address",
        "recurrence",
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `${field} is required.`);
        }
    };

    if (recurrence !== "none" && !recurrence_end) {
        throw new ApiError(400, 'Recurrence end date is required for recurring events.');
    }
    console.log("date", date)
    console.log("featured", end_date)

    // const eventDate = DateTime.fromISO(date, { zone: "America/Costa_Rica" }).toJSDate();
    // const eventEndDate = DateTime.fromISO(end_date, { zone: "America/Costa_Rica" }).toJSDate();

    // if (isNaN(eventDate.getTime()) || isNaN(eventEndDate.getTime())) {
    //     throw new ApiError(400, 'Invalid date format.');
    // }

    // let recurrence_endDate = recurrence_end;
    // if (recurrence_end) {
    //     recurrence_endDate = DateTime.fromISO(recurrence_end, { zone: "America/Costa_Rica" }).toJSDate();
    //     if (isNaN(recurrence_endDate.getTime())) {
    //         throw new ApiError(400, 'Invalid recurrence end date format.');
    //     }
    // }

    // let featuredDate = featured;
    // if (featured) {
    //     featuredDate = DateTime.fromISO(featured, { zone: "America/Costa_Rica" }).toJSDate();
    //     if (isNaN(featuredDate.getTime())) {
    //         throw new ApiError(400, 'Invalid featured date format.');
    //     }
    // }

    const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
    };

    let images: any = [];
    if (event_image && Array.isArray(event_image)) {
        images = event_image.map(file => `/images/events/${file.filename}`);
    }



    const newEvent = await Event.create({
        vendor: userId,
        name,
        date: date,
        time,
        duration,
        option,
        social_media,
        location,
        description,
        category,
        event_image: images,
        featured: featured,
        end_date: end_date,
        address,
        recurrence,
        recurrence_end: recurrence_end,
        spanishDescription
    });

    if (!newEvent) {
        throw new ApiError(500, 'Failed to create event.');
    };


    return newEvent;
};

const createAdminNewEvent = async (req: Request) => {
    const { userId, authId, role } = req.user as IReqUser;
    const { event_image } = req.files as { event_image: Express.Multer.File[] };
    const { name, date, time, featured,
        vendor,
        social_media,
        end_date,
        address,
        duration, option, longitude, latitude, description, recurrence, category, recurrence_end, end_time } = req.body as any;

    const data = req.body;
    const requiredFields = [
        "name",
        "date",
        "time",
        "longitude",
        "latitude",
        "category",
        "end_date",
        "address",
        "recurrence",
        "vendor"
    ];

    console.log("=a=recurrence_end=", recurrence_end)
    console.log("=a=end_date=", end_date)
    console.log("=a=date=", date)
    console.log("=a=featured=", featured)

    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `${field} is required.`);
        }
    };

    if (recurrence !== "none" && !recurrence_end) {
        throw new ApiError(400, 'Recurrence end date is required for recurring events.');
    }
    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime())) {
        throw new ApiError(400, 'Invalid date format.');
    };

    const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
    };

    let images: any = [];
    if (event_image && Array.isArray(event_image)) {
        images = event_image.map(file => `/images/events/${file.filename}`);
    }

    const newEvent = await Event.create({
        vendor: vendor,
        name,
        date: eventDate,
        time,
        duration,
        option,
        social_media,
        location,
        description,
        category,
        event_image: images,
        featured,
        end_date,
        address,
        recurrence,
        recurrence_end,
        end_time
    });

    if (!newEvent) {
        throw new ApiError(500, 'Failed to create event.');
    };


    return newEvent;
};

const updateEvents = async (req: Request) => {
    try {
        const { userId } = req.user as IReqUser;
        const { eventId } = req.params;

        if (!eventId) {
            throw new ApiError(400, 'Event ID is required.');
        }

        const {
            name, date, time, duration, address, option, end_date,
            featured, social_media, longitude, latitude,
            recurrence_end, recurrence, description, category, spanishDescription, end_time
        } = req.body;

        console.log("=u=recurrence_end=", recurrence_end)
        console.log("=u=end_date=", end_date)
        console.log("=u=date=", date)
        console.log("=u=featured=", featured)

        const { event_image } = req.files as { event_image: Express.Multer.File[] };
        let images: string[] = [];

        if (event_image && Array.isArray(event_image)) {
            images = event_image.map(file => `/images/events/${file.filename}`);
        }

        const existingEvent = await Event.findById(eventId) as any;
        if (!existingEvent) {
            throw new ApiError(404, 'Event not found or unauthorized.');
        }
        console.log("date==", date)
        console.log("end_date===", date)


        // let dateUpdate = date ? date : existingEvent.date;
        // if (dateUpdate) {
        //     const inputDate = new Date(dateUpdate);
        //     console.log("date==inputDate", date)

        //     const eventDate = DateTime.fromJSDate(inputDate, { zone: "America/Costa_Rica" }).toJSDate();
        //     console.log("eventDate", eventDate)
        //     if (isNaN(eventDate.getTime())) {
        //         throw new ApiError(400, 'Invalid date format.');
        //     }
        //     console.log("eventDate", eventDate)
        //     existingEvent.date = eventDate;
        // }

        // let endDateUpdate = end_date ? end_date : existingEvent.end_date;
        // if (endDateUpdate) {
        //     const inputDate = new Date(endDateUpdate);
        //     console.log("end_date===inputDate", inputDate)
        //     // const eventEndDate = DateTime.fromJSDate(inputDate, { zone: "America/Costa_Rica" }).toJSDate();
        //     // if (isNaN(eventEndDate.getTime())) {
        //     //     throw new ApiError(400, 'Invalid end_date format.');
        //     // }
        //     // console.log("eventEndDate", eventEndDate)
        //     // existingEvent.end_date = eventEndDate;
        // }

        // let featuredDate = featured ? featured : existingEvent.featured;
        // if (featuredDate) {
        //     const inputDate = new Date(featuredDate);
        //     featuredDate = DateTime.fromJSDate(inputDate, { zone: "America/Costa_Rica" }).toJSDate();
        //     console.log("featuredDate", featuredDate)
        //     if (isNaN(featuredDate.getTime())) {
        //         throw new ApiError(400, 'Invalid date format.');
        //     }
        // }

        // let recurrence_endUpdate = recurrence_end ? recurrence_end : existingEvent.recurrence_end;
        // if (recurrence_endUpdate) {
        //     const inputDate = new Date(recurrence_endUpdate);
        //     const recurrence_endEndDate = DateTime.fromJSDate(inputDate, { zone: "America/Costa_Rica" }).toJSDate();
        //     if (isNaN(recurrence_endEndDate.getTime())) {
        //         throw new ApiError(400, 'Invalid end_date format.');
        //     }
        //     existingEvent.recurrence_end = recurrence_endEndDate;
        // }

        if (name) existingEvent.name = name;
        if (time) existingEvent.time = time;
        if (date) existingEvent.date = date;
        if (duration) existingEvent.duration = duration;
        if (address) existingEvent.address = address;
        if (option) existingEvent.option = option;
        if (end_time) existingEvent.end_time = end_time;
        if (end_date) existingEvent.end_date = end_date;
        if (featured !== undefined) existingEvent.featured = featured;
        if (featured === undefined) existingEvent.featured = null;
        if (social_media) existingEvent.social_media = social_media;
        if (category) existingEvent.category = category;
        if (description) existingEvent.description = description;
        if (spanishDescription) existingEvent.spanishDescription = spanishDescription;
        if (recurrence_end) existingEvent.recurrence_end = recurrence_end;
        if (recurrence) existingEvent.recurrence = recurrence;

        if (longitude && latitude) {
            existingEvent.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            };
        }
        if (images.length > 0) existingEvent.event_image = images;

        existingEvent.status = 'updated';
        const updatedEvent = await existingEvent.save();

        console.log("updatedEvent", updatedEvent)

        return updatedEvent;
    } catch (error) {
        console.error('Error updating event:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Failed to update event.');
    }
};

const deleteEvents = async (req: Request) => {
    const { eventId } = req.params;

    if (!eventId) {
        throw new ApiError(404, 'Event id is required.');
    }

    const event = await Event.findById(eventId) as IEvent;
    if (!event) {
        throw new ApiError(404, 'Event not found.');
    }

    const isFeatured = event.featured;

    try {

        await Event.findByIdAndDelete(eventId);

        return { message: 'Event canceled successfully and plan updated.' };
    } catch (error) {
        console.error(error);  // Log the error to get more info
        throw new ApiError(500, 'Error while deleting the event or updating the plan.');
    }
};

const approveEvents = async (req: Request) => {
    const id = req.params.id;
    const result = await Event.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!result) {
        throw new ApiError(404, 'Event not found.');
    }
    return result;
};
const declinedEvents = async (req: Request) => {
    const id = req.params.id;
    const { reason } = req.body;
    const dataDb = await Event.findById(id).populate('vendor') as any
    if (!dataDb) {
        throw new ApiError(404, 'Event not found.');
    }
    const vendor = dataDb?.vendor;
    const result = await Event.findByIdAndUpdate(id, { status: 'declined' }, { new: true });
    if (vendor) {
        sendResetEmail(
            vendor?.email,
            `<!DOCTYPE html>
              <html lang="en">
             <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
             <title>Advertisement Declined</title>
             <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #555;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999;
                }
             </style>
             </head>
             <body>
                 <div class="container">
                      <h1>Hello, ${vendor.name}</h1>
                      <p>Thank you for submitting your advertisement with us. Unfortunately, we must inform you that your advertisement has been declined. Here is the reason provided:</p>
                       <p><strong>${reason}</strong></p> 
                          <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
                         <p>Thank you for your understanding.</p>
                      <div class="footer">
                          <p>&copy; ${new Date().getFullYear()} Whatsupjaco.com</p>
                      </div>
                 </div>
              </body>
              </html>`
        );
    }

    return result;
};

// const getEvents = async (req: Request) => {
//     let query = Object.fromEntries(
//         Object.entries(req.query).filter(([_, value]) => value)
//     ) as any;

//     const dates = new Date();
//     dates.setHours(dates.getHours() - 6);
//     console.log("=========", dates.toISOString());


//     query.limit = 12;
//     if (!query.page) {
//         query.page = 1
//     }

//     let filterConditions: any = { status: 'approved', active: true };

//     if (query.category) {
//         delete query.upcoming;
//         filterConditions.category = query.category;
//     }

//     if (query.option) {
//         delete query.upcoming;
//         const options = query.option.split(',');
//         filterConditions.option = { $in: options };
//     }

//     console.log("=========", query)

//     if (query.upcoming === "upcoming") {
//         filterConditions.date = { $gte: dates.toISOString() };
//         filterConditions.category = { $ne: '677ba67ac2771b3198bcbf2c' };
//     }
//     if (query.date) {
//         delete query.upcoming;

//         const dateArray = query.date.split(',').map((date: string) => date.trim());

//         const validDates = dateArray.map((dateStr: string) => {
//             const [day, month, year] = dateStr.split('-');
//             const formattedDate = new Date(`${year}-${month}-${day}`);
//             if (isNaN(formattedDate.getTime())) {
//                 throw new ApiError(400, `Invalid date format: ${dateStr}`);
//             }
//             formattedDate.setHours(0, 0, 0, 0);
//             return formattedDate;
//         });

//         filterConditions.$or = validDates.map((date: Date) => ({
//             $or: [
//                 {
//                     $and: [
//                         { date: { $gte: date } },
//                         { end_date: { $lt: new Date(date.getTime() + 86400000) } }
//                     ]
//                 },
//                 { date: { $lte: date }, end_date: { $gte: date } },
//                 { date: { $gte: date }, end_date: { $lte: date } },
//             ]
//         }));
//     }

//     if (query.searchTerm) {
//         delete query.upcoming;
//         const searchRegex = new RegExp(query.searchTerm, 'i');
//         filterConditions.$or = [
//             { name: searchRegex },
//             { description: searchRegex },
//             { spanishDescription: searchRegex },
//         ];
//     }

//     let categoryQuery = Event.find(filterConditions)
//         .sort({ date: 1 })
//         .select('name event_image location category address date')
//         .populate({
//             path: 'category',
//             match: query.searchTerm ? { name: new RegExp(query.searchTerm, 'i') } : {},
//             select: 'name',
//         })
//         .populate({
//             path: 'vendor',
//             select: 'business_name email name',
//         })

//     if (query.sort) {
//         const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
//         const sortOrder = query.sort.startsWith('-') ? -1 : 1;
//         categoryQuery = categoryQuery.sort({ [sortField]: sortOrder });
//     }

//     const page = parseInt(query.page || '1', 10);
//     const limit = parseInt(query.limit || '10', 10);
//     categoryQuery = categoryQuery.skip((page - 1) * limit).limit(limit);

//     const result = await categoryQuery.exec();

//     const total = await Event.countDocuments(filterConditions);
//     const meta = {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//     };

//     console.log("defaultDate=========", query)

//     // if (dates) {
//     //     const event = await Event.updateMany(
//     //         {
//     //             active: true,
//     //             end_date: { $lte: query?.defaultDate },
//     //         },
//     //         {
//     //             $set: { active: false },
//     //         }
//     //     );
//     //     if (event.modifiedCount > 0) {
//     //         logger.info(`Set ${event.modifiedCount} inactive events.`);
//     //     }
//     // }

//     return { result, meta };
// };


const getEvents = async (req: Request) => {
    let query = Object.fromEntries(
        Object.entries(req.query).filter(([_, value]) => value)
    ) as any;

    const dates = new Date();
    dates.setHours(dates.getHours() - 6);  // Adjust the time by -6 hours
    console.log("=========", dates.toISOString());

    query.limit = 12;
    if (!query.page) {
        query.page = 1
    }

    let filterConditions: any = { status: 'approved', active: true };

    if (query.category) {
        delete query.upcoming;
        filterConditions.category = query.category;
    }

    if (query.option) {
        delete query.upcoming;
        const options = query.option.split(',');
        filterConditions.option = { $in: options };
    }

    console.log("=========", query);

    if (query.upcoming === "upcoming") {
        filterConditions.date = { $gte: dates.toISOString() };
        filterConditions.category = { $ne: '677ba67ac2771b3198bcbf2c' };
    }
    if (query.date) {
        delete query.upcoming;

        const dateArray = query.date.split(',').map((date: string) => date.trim());

        const validDates = dateArray.map((dateStr: string) => {
            const [day, month, year] = dateStr.split('-');
            const formattedDate = new Date(`${year}-${month}-${day}`);
            if (isNaN(formattedDate.getTime())) {
                throw new ApiError(400, `Invalid date format: ${dateStr}`);
            }
            formattedDate.setHours(0, 0, 0, 0);
            return formattedDate;
        });

        filterConditions.$or = validDates.map((date: Date) => ({
            $or: [
                {
                    $and: [
                        { date: { $gte: date } },
                        { end_date: { $lt: new Date(date.getTime() + 86400000) } }
                    ]
                },
                { date: { $lte: date }, end_date: { $gte: date } },
                { date: { $gte: date }, end_date: { $lte: date } },
            ]
        }));
    }

    if (query.searchTerm) {
        delete query.upcoming;
        const searchRegex = new RegExp(query.searchTerm, 'i');
        filterConditions.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { spanishDescription: searchRegex },
        ];
    }

    let categoryQuery = Event.find(filterConditions)
        .sort({ date: 1 })
        .select('name event_image location category address date')
        .populate({
            path: 'category',
            match: query.searchTerm ? { name: new RegExp(query.searchTerm, 'i') } : {},
            select: 'name',
        })
        .populate({
            path: 'vendor',
            select: 'business_name email name',
        });

    if (query.sort) {
        const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
        const sortOrder = query.sort.startsWith('-') ? -1 : 1;
        categoryQuery = categoryQuery.sort({ [sortField]: sortOrder });
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    categoryQuery = categoryQuery.skip((page - 1) * limit).limit(limit);

    const result = await categoryQuery.exec();

    // Check each event if its date matches the adjusted 'dates' and add 'today: true'
    result.forEach((event: any) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);  // Set to midnight for comparison

        if (eventDate.getTime() === dates.getTime()) {
            event.today = true;
        }
    });

    const total = await Event.countDocuments(filterConditions);
    const meta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { result, meta };
};

const getPopularMostEvents = async (req: Request) => {
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const result = await Event.find({ status: 'approved', active: true })
            .sort({ favorites: -1 })
            .limit(limit)
            .select('name event_image location category favorites address')
            .populate('category');

        return { result };
    } catch (error) {
        console.error('Error fetching popular most events:', error);
        throw new ApiError(500, 'Internal Server Error');
    }
};

const getAllEvents = async (req: Request) => {
    const query = req.query;

    console.log(query.date);
    const categoryQuery = new QueryBuilder(
        Event.find()
            .populate('category', 'name')
            .populate('vendor', 'name email profile_image'),
        query,
    )
        .search(['name', 'category'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await categoryQuery.modelQuery;
    const meta = await categoryQuery.countTotal();
    return { result, meta }
};
const getFeaturedEvents = async (req: Request) => {
    const result = await Event.find({
        status: 'approved',
        active: true,
        featured: { $ne: null }
    })
        .select('name date event_image location category address vendor')
        .populate('category', 'name')
        .populate('vendor', 'business_name')

    return { result }
};
const duplicateEvents = async (req: Request) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).lean();

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const { _id, createdAt, updatedAt, ...other } = event as any;

    const newEvent = new Event({
        ...other,
        status: 'pending',
    });

    const duplicateEvent = await newEvent.save();

    return duplicateEvent;
};
// ----------------------
const getEventsByDate = async (req: Request) => {
    const { date } = req.body;
    if (!date) {
        throw new ApiError(400, 'Invalid date format.');
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, 'Invalid date format.');
    }
    const customDate = parsedDate.toISOString().slice(0, 10);

    const result = await Event.find({ status: "approved", active: true, date: customDate })
        .select('name event_image location category address')
        .populate('category', 'name')

    return { result };
};
const getPastEvents = async (req: Request) => {
    const { date } = req.body;
    if (!date) {
        throw new ApiError(400, 'Invalid date format.');
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, 'Invalid date format.');
    }
    const customDate = parsedDate.toISOString().slice(0, 10);
    const result = await Event.find({
        status: 'approved',
        end_date: { $lt: customDate }
    })
        .select('name event_image location category address')
        .populate('category', 'name')

    return { result };
};
const getVendorEvents = async (req: Request) => {
    const { vendorId } = req.params;
    if (!vendorId) {
        throw new ApiError(400, 'Vendor Id is required.');
    }
    const result = await Event.find({
        status: 'approved', vendor: vendorId
    })
        .select('name event_image location category address')
        .populate('category', 'name')
    return { result };
};

const getVendorFeatured = async (req: Request) => {
    const { vendorId } = req.params;
    if (!vendorId) {
        throw new ApiError(400, 'Vendor Id is required.');
    }

    const result = await Event.find({
        status: 'approved', vendor: vendorId, featured: { $ne: null }
    })
        .sort({ date: 1 })
        .select('name event_image location category address')
        .populate('category', 'name')

    return { result };
};
// -------------
const saveUserClickEvent = async (req: Request) => {
    const eventId = req.params.id;

    const existingEvent: any = await Event.findById(eventId);
    if (!existingEvent) {
        throw new ApiError(404, 'Event not found or unauthorized.');
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { favorites: 1 } },
        { new: true }
    );

    await ClickOverview.create({ eventId })

    return updatedEvent
};

const getMyEvents = async (req: Request) => {
    const { userId } = req.user as IReqUser;
    const query = req.query;

    const categoryQuery = new QueryBuilder(
        Event.find({ vendor: userId })
            .populate('category', 'name'),
        query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();


    const result = await categoryQuery.modelQuery;
    const meta = await categoryQuery.countTotal();
    return { result, meta }
}
const eventClickOverview = async (req: Request) => {
    try {
        const { year } = req.query as { year: string };
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const now = new Date();
        const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
        const startOfLastYear = new Date(Date.UTC(selectedYear - 1, 0, 1));
        const endOfLastYear = startOfYear;
        const startOfMonth = new Date(Date.UTC(selectedYear, now.getUTCMonth(), 1));
        const startOfLastMonth = new Date(Date.UTC(selectedYear, now.getUTCMonth() - 1, 1));
        const startOfToday = new Date(Date.UTC(selectedYear, now.getUTCMonth(), now.getUTCDate()));
        const startOfYesterday = new Date(Date.UTC(selectedYear, now.getUTCMonth(), now.getUTCDate() - 1));

        // Helper function to fetch click count
        const countClicksInRange = async (start: Date, end: Date) => {
            return ClickOverview.countDocuments({ createdAt: { $gte: start, $lt: end } });
        };

        // Calculate growth percentages
        const calculateGrowth = (current: number, previous: number) => {
            return previous > 0 ? ((current - previous) / previous) * 100 : 0;
        };

        // Yearly growth
        const [clicksThisYear, clicksLastYear] = await Promise.all([
            countClicksInRange(startOfYear, now),
            countClicksInRange(startOfLastYear, endOfLastYear),
        ]);
        const yearlyGrowth = calculateGrowth(clicksThisYear, clicksLastYear);

        // Monthly growth
        const [clicksThisMonth, clicksLastMonth] = await Promise.all([
            countClicksInRange(startOfMonth, now),
            countClicksInRange(startOfLastMonth, startOfMonth),
        ]);
        const monthlyGrowth = calculateGrowth(clicksThisMonth, clicksLastMonth);

        // Daily growth
        const [clicksToday, clicksYesterday] = await Promise.all([
            countClicksInRange(startOfToday, now),
            countClicksInRange(startOfYesterday, startOfToday),
        ]);
        const dailyGrowth = calculateGrowth(clicksToday, clicksYesterday);

        // Monthly click aggregation
        const monthlyData = await ClickOverview.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lt: new Date(Date.UTC(selectedYear + 1, 0, 1)) },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalClicks: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    totalClicks: 1,
                },
            },
            { $sort: { month: 1 } },
        ]);


        const clickOverview = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyData.find((data) => data.month === i + 1) || {
                month: i + 1,
                totalClicks: 0,
            };
            return monthData.totalClicks;
        });

        // Return overview
        return {
            selectedYear,
            yearlyGrowth: yearlyGrowth.toFixed(2) + '%',
            monthlyGrowth: monthlyGrowth.toFixed(2) + '%',
            dailyGrowth: dailyGrowth.toFixed(2) + '%',
            clickOverview,
        };
    } catch (error: any) {
        console.error("Error fetching click overview:", error);
        throw new ApiError(500, "Internal Server Error");
    }
};

const updateFeatured = async (req: Request) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            throw new ApiError(400, 'Event ID is required.');
        }
        const { featured } = req.body;
        const existingEvent = await Event.findById(eventId) as any;
        if (!existingEvent) {
            throw new ApiError(404, 'Event not found or unauthorized.');
        }

        existingEvent.featured = featured;
        const result = await existingEvent.save();

        let massage = featured === null ? "Featured add successfully" :
            "Featured cancel successfully"

        return { result, massage };
    } catch (error) {
        console.error('Error updating event:', error);
        throw new ApiError(500, 'Failed to update event.');
    }
};

const getPastEventsByVendor = async (vendorId: string) => {
    try {
        const currentDate = new Date();
        console.log('cn', vendorId, currentDate);
        const pastEvents = await Event.find({
            vendor: vendorId,
            end_date: { $lt: currentDate },
        }).exec();

        return pastEvents;
    } catch (error) {
        console.error('Error fetching past events:', error);
        throw error;
    }
};


export const EventService = {
    getEvents,
    createNewEvent,
    updateEvents,
    deleteEvents,
    approveEvents,
    saveUserClickEvent,
    getPopularMostEvents,
    getFeaturedEvents,
    getEventsByDate,
    getPastEvents,
    getAllEvents,
    getVendorEvents,
    getVendorFeatured,
    declinedEvents,
    duplicateEvents,
    getMyEvents,
    eventClickOverview,
    updateFeatured,
    getPastEventsByVendor,
    createAdminNewEvent
};