const fs = require('fs');

/**
 * Process uploaded product images
 * Simply returns the uploaded files with their URLs
 */
exports.processProductImages = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  const processedImages = [];

  for (const file of files) {
    processedImages.push({
      original: file,
      url: `/uploads/products/${file.filename}`,
      path: file.path
    });
  }

  return processedImages;
};

/**
 * Delete product image file
 */
exports.deleteProductImage = async (imagePath) => {
  try {
    if (!imagePath || !fs.existsSync(imagePath)) {
      return;
    }

    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Clean up uploaded files on error
 */
exports.cleanupFiles = (files) => {
  if (!files || files.length === 0) return;

  files.forEach(file => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};
