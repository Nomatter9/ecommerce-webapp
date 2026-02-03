const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const db = require('../../models');
const Order = db.Order;
const OrderItem = db.OrderItem;
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;
const ProductImage = db.ProductImage;
const Address = db.Address;
const User = db.User;

/**
 * Helper function to generate unique order number
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Format: ORD-YYYYMMDD-XXXXX
  const prefix = `ORD-${year}${month}${day}`;

  // Find the last order number for today
  const lastOrder = await Order.findOne({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Create order from cart
 * POST /api/orders
 */
exports.createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { shippingAddressId, paymentMethod, notes, couponCode } = req.body;

    // Get user's cart with items
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
      transaction,
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify shipping address exists and belongs to user
    const shippingAddress = await Address.findOne({
      where: { id: shippingAddressId, userId },
      transaction,
    });

    if (!shippingAddress) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Shipping address not found' });
    }

    // Validate stock availability for all items
    const stockErrors = [];
    for (const item of cart.items) {
      if (!item.product.isActive) {
        stockErrors.push(`${item.product.name} is no longer available`);
      } else if (item.product.stockQuantity < item.quantity) {
        stockErrors.push(
          `${item.product.name}: only ${item.product.stockQuantity} items available (requested ${item.quantity})`
        );
      }
    }

    if (stockErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Stock validation failed',
        errors: stockErrors,
      });
    }

    // Calculate order totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.priceAtAdd) * item.quantity,
      0
    );

    // TODO: Calculate shipping cost based on weight, location, etc.
    const shippingCost = 0;

    // TODO: Apply coupon discount if provided
    const discount = 0;

    // TODO: Calculate tax based on location
    const tax = 0;

    const total = subtotal + shippingCost - discount + tax;

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create address snapshot
    const addressSnapshot = {
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      streetAddress: shippingAddress.streetAddress,
      addressLine2: shippingAddress.addressLine2,
      suburb: shippingAddress.suburb,
      city: shippingAddress.city,
      province: shippingAddress.province,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    };

    // Create order
    const order = await Order.create(
      {
        orderNumber,
        userId,
        status: 'pending',
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        shippingAddressId,
        shippingAddressSnapshot: addressSnapshot,
        paymentMethod,
        paymentStatus: 'pending',
        notes,
        couponCode,
      },
      { transaction }
    );

    // Create order items and update product stock
    for (const item of cart.items) {
      // Create product snapshot
      const productSnapshot = {
        name: item.product.name,
        sku: item.product.sku,
        description: item.product.description,
        brand: item.product.brand,
      };

      // Create order item
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          productSnapshot,
          quantity: item.quantity,
          unitPrice: item.priceAtAdd,
          totalPrice: parseFloat(item.priceAtAdd) * item.quantity,
          status: 'pending',
        },
        { transaction }
      );

      // Decrease product stock
      await item.product.decrement('stockQuantity', {
        by: item.quantity,
        transaction,
      });
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });
    await cart.update({ totalItems: 0, subtotal: 0 }, { transaction });

    // Commit transaction
    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'sku'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['id', 'url', 'altText'],
                  where: { isPrimary: true },
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: Address,
          as: 'shippingAddress',
        },
      ],
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

/**
 * Get all orders (with role-based filtering)
 * GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    // Build where clause based on role
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Customers can only see their own orders
    if (userRole === 'customer') {
      where.userId = userId;
    }

    // Sellers can see orders containing their products
    let include = [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'sku'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'url', 'altText'],
                where: { isPrimary: true },
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ];

    // For sellers, filter to orders with their products
    if (userRole === 'seller') {
      include[0].include[0].where = { userId };
      include[0].required = true;
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.json({
      orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
exports.getOrderById = async (req, res) => {
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
    const userRole = req.user.role;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'sku', 'price'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['id', 'url', 'altText'],
                  where: { isPrimary: true },
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: Address,
          as: 'shippingAddress',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Access control
    if (userRole === 'customer' && order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Sellers can only view orders containing their products
    if (userRole === 'seller') {
      const hasSellerProduct = order.items.some(item => item.product.userId === userId);
      if (!hasSellerProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      message: 'Order retrieved successfully',
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Only admin and sellers can update order status
    if (userRole === 'customer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'userId'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Sellers can only update orders with their products
    if (userRole === 'seller') {
      const hasSellerProduct = order.items.some(item => item.product.userId === userId);
      if (!hasSellerProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update delivered timestamp if status is delivered
    const updateData = { status };
    if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

/**
 * Update shipping information
 * PUT /api/orders/:id/shipping
 */
exports.updateShippingInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { trackingNumber, shippingCarrier, estimatedDelivery } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Only admin and sellers can update shipping info
    if (userRole === 'customer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'userId'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Sellers can only update orders with their products
    if (userRole === 'seller') {
      const hasSellerProduct = order.items.some(item => item.product.userId === userId);
      if (!hasSellerProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await order.update({
      ...(trackingNumber && { trackingNumber }),
      ...(shippingCarrier && { shippingCarrier }),
      ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
    });

    res.json({
      message: 'Shipping information updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update shipping info error:', error);
    res.status(500).json({ message: 'Failed to update shipping information' });
  }
};

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customers can only cancel their own orders if pending or confirmed
    if (userRole === 'customer') {
      if (order.userId !== userId) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Access denied' });
      }

      if (!['pending', 'confirmed'].includes(order.status)) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Order cannot be cancelled. Please contact support.',
        });
      }
    }

    // Update order status to cancelled
    await order.update({ status: 'cancelled' }, { transaction });

    // Restore product stock
    for (const item of order.items) {
      await Product.increment('stockQuantity', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    await transaction.commit();

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

/**
 * Get order statistics (admin only)
 * GET /api/orders/stats
 */
exports.getOrderStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const processingOrders = await Order.count({ where: { status: 'processing' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    const totalRevenue = await Order.sum('total', {
      where: { paymentStatus: 'paid' },
    });

    res.json({
      message: 'Order statistics retrieved successfully',
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve order statistics' });
  }
};
