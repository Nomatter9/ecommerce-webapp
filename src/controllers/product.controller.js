const { validationResult } = require('express-validator');
const slugify = require('slugify');
const { Op } = require('sequelize');
const db = require('../../models');
const { processProductImages, deleteProductImage, cleanupFiles } = require('../utils/imageProcessor');
const { deleteUploadedFiles } = require('../middleware/upload.middleware');

const Product = db.Product;
const ProductImage = db.ProductImage;
const Category = db.Category;
const Review = db.Review;

/**
 * Create a new product
 * POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      shortDescription,
      sku,
      price,
      compareAtPrice,
      costPrice,
      categoryId,
      brand,
      stockQuantity,
      lowStockThreshold,
      weight,
      dimensions,
      isActive,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if SKU already exists
    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(409).json({ message: 'SKU already exists' });
    }

    // Generate slug from name
    let slug = slugify(name, { lower: true, strict: true });

    // Ensure slug is unique
    let slugExists = await Product.findOne({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
      slugExists = await Product.findOne({ where: { slug } });
      counter++;
    }

    // Parse dimensions if it's a string
    let parsedDimensions = dimensions;
    if (typeof dimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (error) {
        parsedDimensions = null;
      }
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      sku,
      price,
      compareAtPrice,
      costPrice,
      categoryId,
      userId: req.user.role === 'admin' ? null : req.user.id, // NULL for admin, userId for sellers
      brand,
      stockQuantity: stockQuantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
      weight,
      dimensions: parsedDimensions,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || shortDescription,
    });

    // Process and save images if uploaded
    if (req.files && req.files.length > 0) {
      try {
        const processedImages = await processProductImages(req.files);

        // Save image records to database
        for (let i = 0; i < processedImages.length; i++) {
          const imageData = processedImages[i];
          await ProductImage.create({
            productId: product.id,
            url: imageData.url,
            altText: `${product.name} - Image ${i + 1}`,
            isPrimary: i === 0, // First image is primary
            sortOrder: i
          });
        }
      } catch (imageError) {
        console.error('Error processing images:', imageError);
        // Product is created but images failed - cleanup uploaded files
        if (req.files) {
          cleanupFiles(req.files);
        }
      }
    }

    // Fetch product with images
    const productWithImages = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'altText', 'isPrimary', 'sortOrder']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: productWithImages
    });
  } catch (error) {
    console.error('Create product error:', error);
    // Cleanup uploaded files on error
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
};

/**
 * Get all products with filters and pagination
 * GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      categoryId,
      minPrice,
      maxPrice,
      brand,
      isActive,
      isFeatured,
      search,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    // Build where clause
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (brand) {
      where.brand = brand;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    // If user is a seller (not admin), only show their products
    if (req.user && req.user.role === 'seller') {
      where.userId = req.user.id;
    }

    const offset = (page - 1) * limit;

    // Fetch products
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'altText', 'isPrimary', 'sortOrder'],
          order: [['sortOrder', 'ASC']]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: db.User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Get a single product by ID or slug
 * GET /api/products/:id
 */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is numeric (ID) or string (slug)
    const where = isNaN(id) ? { slug: id } : { id: parseInt(id) };

    const product = await Product.findOne({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'altText', 'isPrimary', 'sortOrder'],
          order: [['sortOrder', 'ASC']]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'parentId']
        },
        {
          model: db.User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

/**
 * Update a product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sellers can only update their own products, admins can update any
    if (req.user.role === 'seller' && product.userId !== req.user.id) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const {
      name,
      description,
      shortDescription,
      sku,
      price,
      compareAtPrice,
      costPrice,
      categoryId,
      brand,
      stockQuantity,
      lowStockThreshold,
      weight,
      dimensions,
      isActive,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if category exists (if being updated)
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        if (req.files) {
          deleteUploadedFiles(req.files);
        }
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // Check if SKU already exists (if being updated)
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        if (req.files) {
          deleteUploadedFiles(req.files);
        }
        return res.status(409).json({ message: 'SKU already exists' });
      }
    }

    // Generate new slug if name is being updated
    let slug = product.slug;
    if (name && name !== product.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Ensure slug is unique
      let slugExists = await Product.findOne({
        where: {
          slug,
          id: { [Op.ne]: id }
        }
      });
      let counter = 1;
      while (slugExists) {
        slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
        slugExists = await Product.findOne({
          where: {
            slug,
            id: { [Op.ne]: id }
          }
        });
        counter++;
      }
    }

    // Parse dimensions if it's a string
    let parsedDimensions = dimensions;
    if (typeof dimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (error) {
        parsedDimensions = product.dimensions;
      }
    }

    // Update product
    await product.update({
      name: name || product.name,
      slug,
      description: description !== undefined ? description : product.description,
      shortDescription: shortDescription !== undefined ? shortDescription : product.shortDescription,
      sku: sku || product.sku,
      price: price !== undefined ? price : product.price,
      compareAtPrice: compareAtPrice !== undefined ? compareAtPrice : product.compareAtPrice,
      costPrice: costPrice !== undefined ? costPrice : product.costPrice,
      categoryId: categoryId || product.categoryId,
      brand: brand !== undefined ? brand : product.brand,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : product.stockQuantity,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : product.lowStockThreshold,
      weight: weight !== undefined ? weight : product.weight,
      dimensions: parsedDimensions !== undefined ? parsedDimensions : product.dimensions,
      isActive: isActive !== undefined ? isActive : product.isActive,
      isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
      metaTitle: metaTitle !== undefined ? metaTitle : product.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : product.metaDescription,
    });

    // Process and add new images if uploaded
    if (req.files && req.files.length > 0) {
      try {
        const processedImages = await processProductImages(req.files);

        // Get current max sort order
        const maxSortOrder = await ProductImage.max('sortOrder', {
          where: { productId: product.id }
        }) || -1;

        // Save new image records to database
        for (let i = 0; i < processedImages.length; i++) {
          const imageData = processedImages[i];
          await ProductImage.create({
            productId: product.id,
            url: imageData.url,
            altText: `${product.name} - Image ${maxSortOrder + i + 2}`,
            isPrimary: false,
            sortOrder: maxSortOrder + i + 1
          });
        }
      } catch (imageError) {
        console.error('Error processing images:', imageError);
        if (req.files) {
          cleanupFiles(req.files);
        }
      }
    }

    // Fetch updated product with images
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'altText', 'isPrimary', 'sortOrder']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    res.status(500).json({ message: 'Failed to update product' });
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sellers can only delete their own products, admins can delete any
    if (req.user.role === 'seller' && product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    // Delete all product images from filesystem
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          // Extract file path from URL
          const urlPath = image.url.replace('/uploads/products/', '');
          const imagePath = require('path').join(__dirname, '../../uploads/products', urlPath);
          await deleteProductImage(imagePath);
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      }
    }

    // Delete product (cascade will delete images from DB)
    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

/**
 * Delete a specific product image
 * DELETE /api/products/:id/images/:imageId
 */
exports.deleteProductImageById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, imageId } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sellers can only delete images from their own products, admins can delete any
    if (req.user.role === 'seller' && product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own products' });
    }

    const image = await ProductImage.findOne({
      where: {
        id: imageId,
        productId: id
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete image file from filesystem
    try {
      const urlPath = image.url.replace('/uploads/products/', '');
      const imagePath = require('path').join(__dirname, '../../uploads/products', urlPath);
      await deleteProductImage(imagePath);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    // Delete image record from database
    await image.destroy();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
};

/**
 * Set primary image for a product
 * PUT /api/products/:id/images/:imageId/primary
 */
exports.setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sellers can only manage images for their own products, admins can manage any
    if (req.user.role === 'seller' && product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own products' });
    }

    const image = await ProductImage.findOne({
      where: {
        id: imageId,
        productId: id
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Set all images to non-primary
    await ProductImage.update(
      { isPrimary: false },
      { where: { productId: id } }
    );

    // Set selected image as primary
    await image.update({ isPrimary: true });

    res.json({ message: 'Primary image updated successfully' });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ message: 'Failed to set primary image' });
  }
};
