const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const db = require('../../models');
const User = db.User;
const Order = db.Order;
const Product = db.Product;

/**
 * Get all users with pagination and filters
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      role,
      isVerified,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderNumber', 'status', 'totalAmount', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']],
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const orderCount = await Order.count({ where: { userId: id } });
    const totalSpent = await Order.sum('totalAmount', {
      where: { userId: id, status: { [Op.in]: ['delivered', 'completed'] } }
    }) || 0;

    res.json({
      user,
      stats: {
        totalOrders: orderCount,
        totalSpent: totalSpent,
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

/**
 * Update user verification status
 * PUT /api/admin/users/:id/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isVerified });

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has orders
    const orderCount = await Order.count({ where: { userId: id } });
    if (orderCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with existing orders. Consider deactivating instead.',
        orderCount
      });
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.count();
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const verifiedUsers = await User.count({ where: { isVerified: true } });

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Order statistics
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });

    // Product statistics
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });

    res.json({
      users: {
        total: totalUsers,
        customers: totalCustomers,
        sellers: totalSellers,
        admins: totalAdmins,
        verified: verifiedUsers,
        recentSignups: recentUsers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve statistics' });
  }
};
