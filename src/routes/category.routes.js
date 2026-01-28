const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateCategorySlug,
} = require('../validators/category.validator');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/slug/:slug', validateCategorySlug, categoryController.getCategoryBySlug);
router.get('/:id', validateCategoryId, categoryController.getCategoryById);
router.get('/:id/products', validateCategoryId, categoryController.getCategoryProducts);

// Protected routes (admin only)
router.post('/', authenticate, isAdmin, validateCreateCategory, categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, validateCategoryId, categoryController.deleteCategory);
module.exports = router;
