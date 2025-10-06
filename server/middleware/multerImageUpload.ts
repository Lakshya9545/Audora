// src/middleware/multerImageUpload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR_IMAGES = path.join(__dirname, '..', '..', 'uploads', 'images');

if (!fs.existsSync(UPLOAD_DIR_IMAGES)) {
  fs.mkdirSync(UPLOAD_DIR_IMAGES, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR_IMAGES);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP images are allowed.') as any, false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit for images
  }
});

export default uploadImage;