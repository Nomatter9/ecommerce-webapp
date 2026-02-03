const { validationResult } = require('express-validator');
const db = require('../../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;
const ProductImage = db.ProductImage;

/**
 * Helper function to recalculate cart totals
 */
const recalculateCartTotals = async (cartId) => {
  const cartItems = await CartItem.findAll({
    where: { cartId },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['price'],
      },
    ],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.priceAtAdd) * item.quantity,
    0
  );

  await Cart.update(
    { totalItems, subtotal },
    { where: { id: cartId } }
  );

  return { totalItems, subtotal };
};

/**
 * Get user's cart with all items
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'stockQuantity', 'isActive'],
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
      ],
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({ userId });
      cart.items = [];
    }

    res.json({
      message: 'Cart retrieved successfully',
      cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to retrieve cart' });
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is active
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Only ${product.stockQuantity} items available in stock`,
      });
    }

    // Get or create user's cart
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if product already exists in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Update quantity if item exists
      const newQuantity = cartItem.quantity + quantity;

      // Check stock for updated quantity
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({
          message: `Only ${product.stockQuantity} items available in stock`,
        });
      }

      await cartItem.update({ quantity: newQuantity });
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        priceAtAdd: product.price,
      });
    }

    // Recalculate cart totals
    await recalculateCartTotals(cart.id);

    // Fetch updated cart
    const updatedCart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'stockQuantity', 'isActive'],
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
      ],
    });

    res.status(201).json({
      message: 'Item added to cart successfully',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
exports.updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check if product is still available
    if (!cartItem.product.isActive) {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    // Check stock availability
    if (cartItem.product.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Only ${cartItem.product.stockQuantity} items available in stock`,
      });
    }

    // Update quantity
    await cartItem.update({ quantity });

    // Recalculate cart totals
    await recalculateCartTotals(cart.id);

    // Fetch updated cart
    const updatedCart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'stockQuantity', 'isActive'],
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
      ],
    });

    res.json({
      message: 'Cart item updated successfully',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
exports.removeCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { itemId } = req.params;

    // Get user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and delete cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();

    // Recalculate cart totals
    await recalculateCartTotals(cart.id);

    // Fetch updated cart
    const updatedCart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'stockQuantity', 'isActive'],
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
      ],
    });

    res.json({
      message: 'Item removed from cart successfully',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

/**
 * Clear all items from cart
 * DELETE /api/cart
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete all cart items
    await CartItem.destroy({ where: { cartId: cart.id } });

    // Reset cart totals
    await cart.update({ totalItems: 0, subtotal: 0 });

    res.json({
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};
