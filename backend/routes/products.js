const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { protect, farmerOnly } = require('../middleware/auth');
const fs = require('fs');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// @GET /api/products - Get all products (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (search) query.title = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .populate('farmer', 'name location phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({ products, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name location phone email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @POST /api/products - Farmer creates product
router.post('/', protect, farmerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, price, unit, quantity, location } = req.body;
    const images = req.files?.map(f => f.path) || [];

    const product = await Product.create({
      title, description, category, price, unit, quantity, location,
      images, farmer: req.user._id
    });

    res.status(201).json({ message: 'Product listed successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/products/:id - Farmer updates product
router.put('/:id', protect, farmerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const updates = req.body;
    if (req.files?.length) updates.images = req.files.map(f => f.path);

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @DELETE /api/products/:id


// @DELETE /api/products/:id
router.delete('/:id', protect, farmerOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ✅ Delete images from uploads folder
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('Deleted image:', fullPath);
        }
      });
    }

    await product.deleteOne();
    res.json({ message: 'Product and images deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// @GET /api/products/farmer/my-products
router.get('/farmer/my-products', protect, farmerOnly, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @POST /api/products/:id/rate
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existingRating = product.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      product.ratings.push({ user: req.user._id, rating, comment });
    }

    product.avgRating = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
    await product.save();
    res.json({ message: 'Rating added', avgRating: product.avgRating });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
