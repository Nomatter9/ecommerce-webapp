const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {
  validateListUsers,
  validateGetUser,
  validateUpdateRole,
  validateUpdateStatus,
  validateDeleteUser
} = require('../validators/admin.validator');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

/**
 * User Management Routes
 */

// Get all users with filters and pagination
router.get('/users', validateListUsers, adminController.getAllUsers);

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Get specific user by ID
router.get('/users/:id', validateGetUser, adminController.getUserById);

// Update user role
router.put('/users/:id/role', validateUpdateRole, adminController.updateUserRole);

// Update user verification status
router.put('/users/:id/status', validateUpdateStatus, adminController.updateUserStatus);

// Delete user
router.delete('/users/:id', validateDeleteUser, adminController.deleteUser);

module.exports = router;
