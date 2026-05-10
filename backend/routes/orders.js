const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, farmerOnly } = require('../middleware/auth');

// @POST /api/orders - User places order
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.isAvailable) return res.status(400).json({ message: 'Product not available' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      buyer: req.user._id,
      product: productId,
      farmer: product.farmer,
      quantity,
      totalPrice,
      deliveryAddress,
      notes
    });

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) product.isAvailable = false;
    await product.save();

    await order.populate(['buyer', 'product', 'farmer']);
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/orders/my-orders - Buyer's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('product', 'title images price unit')
      .populate('farmer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/orders/farmer-orders - Farmer's received orders
router.get('/farmer-orders', protect, farmerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('product', 'title images price unit')
      .populate('buyer', 'name phone email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/orders/:id/status - Farmer updates order status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only farmer can confirm/ship/deliver; buyer can cancel
    if (req.user.role === 'farmer' && order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
