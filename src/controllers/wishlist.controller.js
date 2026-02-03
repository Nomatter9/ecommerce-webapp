const { validationResult } = require('express-validator');
const db = require('../../models');
const Wishlist = db.Wishlist;
const Product = db.Product;
const ProductImage = db.ProductImage;
const Category = db.Category;

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'compareAtPrice', 'stockQuantity', 'isActive'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'url', 'altText'],
              where: { isPrimary: true },
              required: false,
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Wishlist retrieved successfully',
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to retrieve wishlist' });
  }
};

/**
 * Add item to wishlist
 * POST /api/wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in wishlist
    const existingItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    if (existingItem) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    // Fetch the created item with product details
    const newItem = await Wishlist.findByPk(wishlistItem.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'compareAtPrice', 'stockQuantity', 'isActive'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'url', 'altText'],
              where: { isPrimary: true },
              required: false,
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      message: 'Product added to wishlist successfully',
      wishlistItem: newItem,
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
};

/**
 * Remove item from wishlist
 * DELETE /api/wishlist/:id
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    // Find and delete wishlist item
    const wishlistItem = await Wishlist.findOne({
      where: { id, userId },
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await wishlistItem.destroy();

    res.json({
      message: 'Item removed from wishlist successfully',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove item from wishlist' });
  }
};

/**
 * Clear entire wishlist
 * DELETE /api/wishlist
 */
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all wishlist items for user
    await Wishlist.destroy({ where: { userId } });

    res.json({
      message: 'Wishlist cleared successfully',
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Failed to clear wishlist' });
  }
};

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    res.json({
      inWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem ? wishlistItem.id : null,
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Failed to check wishlist status' });
  }
};
