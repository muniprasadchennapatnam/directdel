const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other'],
    required: true
  },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'kg' }, // kg, dozen, litre, etc.
  quantity: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String },
  isAvailable: { type: Boolean, default: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  }],
  avgRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
