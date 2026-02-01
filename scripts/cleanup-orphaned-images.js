#!/usr/bin/env node

/**
 * Cleanup script for orphaned product images
 *
 * This script finds and removes image files (large, medium, thumb versions)
 * that don't have a corresponding original file referenced in the database.
 *
 * Usage: node scripts/cleanup-orphaned-images.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const db = require('../models');

const isDryRun = process.argv.includes('--dry-run');

async function cleanupOrphanedImages() {
  try {
    console.log('🔍 Scanning for orphaned product images...\n');

    // Get all product images from database
    const productImages = await db.ProductImage.findAll({
      attributes: ['url']
    });

    // Extract filenames from URLs
    const dbFilenames = new Set();
    productImages.forEach(img => {
      // URL format: /uploads/products/filename.ext
      const filename = img.url.split('/').pop();
      if (filename) {
        dbFilenames.add(filename);
      }
    });

    console.log(`📊 Found ${productImages.length} images in database\n`);

    // Scan uploads/products directory
    const uploadsDir = path.join(__dirname, '../uploads/products');

    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  Uploads directory not found');
      return;
    }

    const filesInDir = fs.readdirSync(uploadsDir);
    console.log(`📂 Found ${filesInDir.length} files in uploads/products\n`);

    // Find orphaned files
    const orphanedFiles = [];

    filesInDir.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && !dbFilenames.has(filename)) {
        orphanedFiles.push({
          filename,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    });

    // Report findings
    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files found!');
      return;
    }

    console.log(`🗑️  Found ${orphanedFiles.length} orphaned files:\n`);

    let totalSize = 0;
    orphanedFiles.forEach(file => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      totalSize += file.size;
      console.log(`  - ${file.filename} (${sizeMB} MB) - Modified: ${file.modified.toISOString()}`);
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`\n📦 Total size: ${totalSizeMB} MB`);

    // Delete or dry run
    if (isDryRun) {
      console.log('\n🔍 DRY RUN - No files were deleted');
      console.log('💡 Run without --dry-run to actually delete these files');
    } else {
      console.log('\n🗑️  Deleting orphaned files...');

      let deletedCount = 0;
      orphanedFiles.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error deleting ${file.filename}:`, error.message);
        }
      });

      console.log(`\n✅ Deleted ${deletedCount} orphaned files (${totalSizeMB} MB freed)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

// Run cleanup
cleanupOrphanedImages();
