const { validationResult } = require('express-validator');
const db = require('../../models');
const Address = db.Address;

/**
 * Get all addresses for the authenticated user
 * GET /api/addresses
 */
exports.getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [
        ['isDefault', 'DESC'], // Default address first
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      addresses,
      count: addresses.length
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Failed to retrieve addresses' });
  }
};

/**
 * Get a specific address by ID
 * GET /api/addresses/:id
 */
exports.getAddressById = async (req, res) => {
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

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id // Ensure user can only access their own addresses
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ address });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ message: 'Failed to retrieve address' });
  }
};

/**
 * Create a new address
 * POST /api/addresses
 */
exports.createAddress = async (req, res) => {
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
      label,
      recipientName,
      phone,
      streetAddress,
      addressLine2,
      suburb,
      city,
      province,
      postalCode,
      country,
      isDefault,
      type
    } = req.body;

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id, isDefault: true } }
      );
    }

    // If this is the first address, make it default automatically
    const existingAddressCount = await Address.count({
      where: { userId: req.user.id }
    });

    const address = await Address.create({
      userId: req.user.id,
      label,
      recipientName,
      phone,
      streetAddress,
      addressLine2,
      suburb,
      city,
      province,
      postalCode,
      country: country || 'South Africa',
      isDefault: existingAddressCount === 0 ? true : (isDefault || false),
      type: type || 'both'
    });

    res.status(201).json({
      message: 'Address created successfully',
      address
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Failed to create address' });
  }
};

/**
 * Update an existing address
 * PUT /api/addresses/:id
 */
exports.updateAddress = async (req, res) => {
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

    // Find address and verify ownership
    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const {
      label,
      recipientName,
      phone,
      streetAddress,
      addressLine2,
      suburb,
      city,
      province,
      postalCode,
      country,
      isDefault,
      type
    } = req.body;

    // If setting as default, unset all other default addresses
    if (isDefault && !address.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id, isDefault: true } }
      );
    }

    // Build update object with only provided fields
    const updateData = {};
    if (label !== undefined) updateData.label = label;
    if (recipientName !== undefined) updateData.recipientName = recipientName;
    if (phone !== undefined) updateData.phone = phone;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (suburb !== undefined) updateData.suburb = suburb;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (type !== undefined) updateData.type = type;

    await address.update(updateData);

    res.json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

/**
 * Set an address as default
 * PUT /api/addresses/:id/set-default
 */
exports.setDefaultAddress = async (req, res) => {
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

    // Find address and verify ownership
    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other default addresses
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.id, isDefault: true } }
    );

    // Set this address as default
    await address.update({ isDefault: true });

    res.json({
      message: 'Default address updated successfully',
      address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
};

/**
 * Delete an address
 * DELETE /api/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
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

    // Find address and verify ownership
    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;

    await address.destroy();

    // If deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      if (nextAddress) {
        await nextAddress.update({ isDefault: true });
      }
    }

    res.json({
      message: 'Address deleted successfully',
      deletedAddressId: id
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};
