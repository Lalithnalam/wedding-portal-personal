const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wedding_portal_uploads',
    // Allow both images and audio (Cloudinary handles format transformations if needed, but we keep original)
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webm', 'mp3', 'wav', 'mp4'],
  },
});

const upload = multer({ storage: storage });

module.exports = {
  cloudinary,
  upload
};
