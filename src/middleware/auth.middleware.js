const jwt = require('jsonwebtoken');
const db = require('../../models');
const User = db.User;

/**
 * Authenticate JWT token
 * Extracts token from Authorization header and verifies it
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

/**
 * Optional authentication
 * Attaches user to request if token is valid, but doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Token invalid or expired, continue without user
    next();
  }
};

/**
 * Authorize specific roles
 * Use after authenticate middleware
 * @param  {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to access this resource' 
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

/**
 * Check if user is seller or admin
 */
exports.isSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!['seller', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Seller access required' });
  }

  next();
};
