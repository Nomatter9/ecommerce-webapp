const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const {
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressId
} = require('../validators/address.validator');
const { authenticate } = require('../middleware/auth.middleware');

// All address routes require authentication
router.use(authenticate);

/**
 * Address Routes
 */

// Get all addresses for the authenticated user
router.get('/', addressController.getUserAddresses);

// Get a specific address by ID
router.get('/:id', validateAddressId, addressController.getAddressById);

// Create a new address
router.post('/', validateCreateAddress, addressController.createAddress);

// Update an existing address
router.put('/:id', validateUpdateAddress, addressController.updateAddress);

// Set an address as default
router.put('/:id/set-default', validateAddressId, addressController.setDefaultAddress);

// Delete an address
router.delete('/:id', validateAddressId, addressController.deleteAddress);

module.exports = router;
