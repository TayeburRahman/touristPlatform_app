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
      } else if (file.fieldname === 'banner_img') {
        uploadPath = 'uploads/banner';
      } else if (file.fieldname === 'banner') {
        uploadPath = 'uploads/vendor';
      } else if (file.fieldname === 'business_profile') {
        uploadPath = 'uploads/vendor';
      } else {
        uploadPath = 'uploads';
      }
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      } 

      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'image/tiff',
        'image/bmp',
        'video/mp4',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
        'video/x-matroska', // MKV
        'video/x-msvideo', // AVI
        'video/quicktime', // MOV
        'video/webm',
        'application/pdf', // Optional if you want to allow PDF uploads
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, uploadPath);
      } else {
        // cb(new Error('Invalid file type'));
        console.log("Invalid file type")
        throw new ApiError(400, 'Invalid file type');
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      'image/bmp',
      'video/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'video/x-matroska', // MKV
      'video/x-msvideo', // AVI
      'video/quicktime', // MOV
      'video/webm',
      'application/pdf', // Optional if you want to allow PDF uploads
    ];

    if (file.fieldname === undefined) {
      cb(null, true);
    } else if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
      throw new ApiError(400, 'Invalid file type');
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
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
