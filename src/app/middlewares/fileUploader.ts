/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import ApiError from '../../errors/ApiError';

export const uploadFile = () => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg',
    'image/webp', 'image/gif', 'image/svg+xml',
    'image/tiff', 'image/bmp', 'video/mp4', 'audio/mpeg'
  ];

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("==================", file);
      let uploadPath = '';

      // Determine upload path based on file fieldname
      switch (file.fieldname) {
        case 'cover_image':
        case 'profile_image':
          uploadPath = 'uploads/images/profile';
          break;
        case 'product_img':
          uploadPath = 'uploads/images/products';
          break;
        case 'image':
          uploadPath = 'uploads/images/image';
          break;
        case 'message_img':
          uploadPath = 'uploads/images/message';
          break;
        case 'video':
          uploadPath = 'uploads/video';
          break;
        case 'event_image':
          uploadPath = 'uploads/images/events';
          break;
        case 'banner_img':
          uploadPath = 'uploads/banner';
          break;
        case 'banner':
        case 'business_profile':
          uploadPath = 'uploads/vendor';
          break;
        default:
          uploadPath = 'uploads';
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Validate file type
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, uploadPath);
      } else {
        console.error(`Invalid file type: ${file.mimetype}`);
        cb(new ApiError(400, 'Invalid file type'), null as any);
      }
    },

    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req: Request, file: any, cb: any) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error(`Invalid file type: ${file.mimetype}`);
      cb(new ApiError(400, `Invalid file type: ${file.mimetype}`), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
  }).fields([
    { name: 'image', maxCount: 30 },
    { name: 'product_img', maxCount: 10 },
    { name: 'cover_image', maxCount: 10 },
    { name: 'profile_image', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'video_thumbnail', maxCount: 10 },
    { name: 'thumbnail', maxCount: 10 },
    { name: 'banner', maxCount: 10 },
    { name: 'message_img', maxCount: 10 },
    { name: 'event_image', maxCount: 10 },
    { name: 'banner_img', maxCount: 10 },
    { name: 'business_profile', maxCount: 1 },
  ]);

  return upload;
};
