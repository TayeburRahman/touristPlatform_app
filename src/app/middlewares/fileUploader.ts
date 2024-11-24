/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import ApiError from '../../errors/ApiError';

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = '';  
      if (
        file.fieldname === 'cover_image' ||
        file.fieldname === 'profile_image'
      ) {
        uploadPath = 'uploads/images/profile';
      } else if (file.fieldname === 'product_img') {
        uploadPath = 'uploads/images/products';
      } else if (file.fieldname === 'image') {
        uploadPath = 'uploads/images/image';
      } else if (file.fieldname === 'message_img') {
        uploadPath = 'uploads/images/message';
      } else if (file.fieldname === 'video') {
        uploadPath = 'uploads/video';
      } else if (file.fieldname === 'event_image') {
        uploadPath = 'uploads/images/events';
      }else if (file.fieldname === 'banner_img') {
        uploadPath = 'uploads/banner';
      }else if (file.fieldname === 'banner') {
        uploadPath = 'uploads/vendor';
      }
      else if (file.fieldname === 'business_profile') {
        uploadPath = 'uploads/vendor';
      } 
      else {
        uploadPath = 'uploads';
      }
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      } 
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        // file.mimetype === 'image/webp' ||
        file.mimetype === 'video/mp4'
      ) {
        cb(null, uploadPath);
      } else {
        //@ts-ignore
        // cb(new Error('Invalid file type'));
        throw new ApiError(400, 'Invalid file type');
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedFieldnames = [
      'image',
      'profile_image',
      'cover_image',
      'product_img',
      'video',
      'thumbnail',
      'video_thumbnail',
      'message_img',
      "banner",
      'event_image',
      'banner_img',
      "business_profile",

    ];

    if (file.fieldname === undefined) {
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'video/mp4'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    } else {
      // cb(new Error('Invalid fieldname'));
      throw new ApiError(400, 'Invalid fieldname');
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: 'image', maxCount: 30 },
    { name: 'product_img', maxCount: 10 },
    { name: 'cover_image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'video_thumbnail', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'message_img', maxCount: 10 },
    { name: 'event_image', maxCount: 10 },
    { name: 'banner_img', maxCount: 10 },
    { name: 'business_profile', maxCount: 1 },
  ]);

  return upload;
};
