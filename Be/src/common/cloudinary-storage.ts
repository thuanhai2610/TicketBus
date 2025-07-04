import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { BadRequestException } from '@nestjs/common';
import { cloudinary } from './cloudinary.config';


const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      return {
        folder: 'avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 300, height: 300, crop: 'limit' }],
      };
    },
  });
  
export default storage;