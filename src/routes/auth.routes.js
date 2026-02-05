const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadProfilePicture, handleUploadError } = require('../middleware/upload.middleware');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.put('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.put(
  '/update-profile',
  authenticate,
  uploadProfilePicture,
  handleUploadError,
  validateUpdateProfile,
  authController.updateProfile
);

module.exports = router;
