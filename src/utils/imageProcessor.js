const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Process and optimize uploaded product images
 * Creates multiple versions: original, large, medium, thumbnail
 */
exports.processProductImages = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  const processedImages = [];

  for (const file of files) {
    try {
      const filename = path.parse(file.filename).name;
      const outputDir = path.dirname(file.path);

      // Define image sizes
      const sizes = {
        large: { width: 1200, height: 1200, suffix: '-large' },
        medium: { width: 600, height: 600, suffix: '-medium' },
        thumbnail: { width: 150, height: 150, suffix: '-thumb' }
      };

      const versions = {
        original: file.path,
        originalUrl: `/uploads/products/${file.filename}`
      };

      // Process each size
      for (const [sizeName, config] of Object.entries(sizes)) {
        const outputFilename = `${filename}${config.suffix}.webp`;
        const outputPath = path.join(outputDir, outputFilename);

        await sharp(file.path)
          .resize(config.width, config.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        versions[sizeName] = outputPath;
        versions[`${sizeName}Url`] = `/uploads/products/${outputFilename}`;
      }

      processedImages.push({
        original: file,
        versions: versions
      });

    } catch (error) {
      console.error('Error processing image:', file.filename, error);
      // Clean up any partially processed files
      throw error;
    }
  }

  return processedImages;
};

/**
 * Delete product image and all its versions
 */
exports.deleteProductImage = async (imagePath) => {
  try {
    if (!imagePath || !fs.existsSync(imagePath)) {
      return;
    }

    const parsedPath = path.parse(imagePath);
    const dir = parsedPath.dir;
    const name = parsedPath.name;

    // Delete original and all versions
    const patterns = [
      imagePath,
      path.join(dir, `${name}-large.webp`),
      path.join(dir, `${name}-medium.webp`),
      path.join(dir, `${name}-thumb.webp`)
    ];

    for (const filePath of patterns) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
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
