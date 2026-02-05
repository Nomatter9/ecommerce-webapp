const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../../uploads/products');
const profileUploadsDir = path.join(__dirname, '../../uploads/profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files per upload
  }
});

// Middleware for single image upload
exports.uploadSingle = upload.single('image');

// Middleware for multiple image uploads
exports.uploadMultiple = upload.array('images', 10);

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: user-{userId}-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : 'unknown';
    cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for profile pictures
const profileUpload = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for profile pictures
    files: 1 // Only one file allowed
  }
});

// Middleware for profile picture upload
exports.uploadProfilePicture = profileUpload.single('profilePicture');

// Error handling middleware for multer errors
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 10 files per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field in upload.'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || 'File upload failed'
    });
  }

  next();
};

// Helper function to delete uploaded files (for cleanup on error)
exports.deleteUploadedFiles = (files) => {
  if (!files) return;

  const filesToDelete = Array.isArray(files) ? files : [files];

  filesToDelete.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};
