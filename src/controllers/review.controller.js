const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const db = require('../../models');

const Review = db.Review;
const Product = db.Product;
const User = db.User;
const Order = db.Order;
const OrderItem = db.OrderItem;

/**
 * Create a review for a product
 * POST /api/products/:productId/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { productId } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId, productId },
    });

    if (existingReview) {
      return res.status(409).json({
        message: 'You have already reviewed this product. Please update your existing review instead.',
      });
    }

    // Check if user has purchased this product (for verified purchase badge)
    const purchasedOrder = await Order.findOne({
      where: {
        userId,
        status: 'delivered',
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { productId },
          required: true,
        },
      ],
    });

    const isVerifiedPurchase = !!purchasedOrder;

    // Create review
    const review = await Review.create({
      userId,
      productId,
      rating,
      title: title || null,
      comment: comment || null,
      isVerifiedPurchase,
      helpfulCount: 0,
      isApproved: true, // Auto-approve for now; can be changed to require admin approval
    });

    // Fetch review with user details
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json({
      message: 'Review created successfully',
      review: reviewWithUser,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

/**
 * Get all reviews for a product
 * GET /api/products/:productId/reviews
 */
exports.getProductReviews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      verifiedOnly,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Build where clause
    const where = {
      productId,
      isApproved: true, // Only show approved reviews
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (verifiedOnly === 'true') {
      where.isVerifiedPurchase = true;
    }

    const offset = (page - 1) * limit;

    // Fetch reviews
    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order.toUpperCase()]],
    });

    // Calculate rating statistics
    const ratingStats = await Review.findAll({
      where: { productId, isApproved: true },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'averageRating'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalReviews'],
      ],
      raw: true,
    });

    const ratingDistribution = await Review.findAll({
      where: { productId, isApproved: true },
      attributes: [
        'rating',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    // Format rating distribution as an object
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item.rating] = parseInt(item.count);
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
      stats: {
        averageRating: parseFloat(ratingStats[0].averageRating) || 0,
        totalReviews: parseInt(ratingStats[0].totalReviews) || 0,
        distribution,
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    // Find review
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Users can only update their own reviews (unless admin)
    if (review.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only update your own reviews',
      });
    }

    // Update review
    await review.update({
      rating: rating !== undefined ? rating : review.rating,
      title: title !== undefined ? title : review.title,
      comment: comment !== undefined ? comment : review.comment,
    });

    // Fetch updated review with user details
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Find review
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Users can only delete their own reviews (unless admin)
    if (review.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only delete your own reviews',
      });
    }

    // Delete review
    await review.destroy();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

/**
 * Get user's own reviews
 * GET /api/reviews/my-reviews
 */
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch your reviews' });
  }
};

/**
 * Toggle review approval (Admin only)
 * PUT /api/reviews/:id/approval
 */
exports.toggleReviewApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // Only admins can approve/disapprove reviews
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({ isApproved });

    res.json({
      message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
      review,
    });
  } catch (error) {
    console.error('Toggle review approval error:', error);
    res.status(500).json({ message: 'Failed to update review approval status' });
  }
};
