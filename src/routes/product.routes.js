const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProduct,
  validateDeleteProduct,
  validateListProducts,
  validateProductImage,
  validateDeleteProductImage
} = require('../validators/product.validator');
const { authenticate, optionalAuth, isAdmin, isSeller } = require('../middleware/auth.middleware');
const { uploadMultiple, handleUploadError } = require('../middleware/upload.middleware');

// Public routes - anyone can view products, but sellers get filtered results
router.get('/', optionalAuth, validateListProducts, productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes - admin and seller only
router.post(
  '/',
  authenticate,
  isSeller,
  uploadMultiple,
  handleUploadError,
  validateCreateProduct,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  isSeller,
  uploadMultiple,
  handleUploadError,
  validateUpdateProduct,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  isSeller,
  validateDeleteProduct,
  productController.deleteProduct
);

// Image management routes
router.delete(
  '/:id/images/:imageId',
  authenticate,
  isSeller,
  validateDeleteProductImage,
  productController.deleteProductImageById
);

router.put(
  '/:id/images/:imageId/primary',
  authenticate,
  isSeller,
  validateProductImage,
  productController.setPrimaryImage
);

module.exports = router;
