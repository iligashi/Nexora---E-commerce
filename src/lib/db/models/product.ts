import mongoose from "mongoose";

export interface Review {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export type ProductStatus = 'draft' | 'published' | 'archived';
export type ProductTag = 'new' | 'sale' | 'trending' | 'featured' | 'bestseller';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    richDescription: { type: String }, // HTML/Markdown content
    images: [{
      url: { type: String, required: true },
      alt: { type: String },
      isPrimary: { type: Boolean, default: false },
    }],
    price: { type: Number, required: true },
    compareAtPrice: { type: Number }, // Original price for sale items
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, enum: ['new', 'sale', 'trending', 'featured', 'bestseller'] }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 5 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number },
    saleStartDate: { type: Date },
    saleEndDate: { type: Date },
    sku: { type: String },
    barcode: { type: String },
    weight: { type: Number }, // in grams
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    attributes: [{
      name: { type: String },
      value: { type: String },
    }],
    variants: [{
      name: { type: String },
      sku: { type: String },
      price: { type: Number },
      stock: { type: Number },
      attributes: [{
        name: { type: String },
        value: { type: String },
      }],
    }],
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ isActive: 1, status: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'variants.sku': 1 });

// Virtual field for current price (either sale price or regular price)
productSchema.virtual('currentPrice').get(function() {
  if (this.onSale && this.salePrice && this.saleStartDate && this.saleEndDate) {
    const now = new Date();
    if (now >= this.saleStartDate && now <= this.saleEndDate) {
      return this.salePrice;
    }
  }
  return this.price;
});

// Virtual field for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.onSale && this.salePrice) {
    const discount = ((this.price - this.salePrice) / this.price) * 100;
    return Math.round(discount);
  }
  return 0;
});

// Virtual field for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

// Method to update rating when a new review is added
productSchema.methods.updateRating = async function(newRating: number) {
  const oldTotal = this.rating * this.numReviews;
  this.numReviews += 1;
  this.rating = (oldTotal + newRating) / this.numReviews;
  return this.save();
};

// Method to check if product can be purchased
productSchema.methods.canPurchase = function(quantity: number) {
  return this.isActive && this.status === 'published' && this.stock >= quantity;
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity: number) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.save();
};

// Static method to find featured products
productSchema.statics.findFeatured = function(limit = 4) {
  return this.find({
    isActive: true,
    status: 'published',
    stock: { $gt: 0 },
    tags: 'featured',
  })
  .sort({ rating: -1, numReviews: -1 })
  .limit(limit);
};

// Static method to find products on sale
productSchema.statics.findOnSale = function(limit = 8) {
  const now = new Date();
  return this.find({
    isActive: true,
    status: 'published',
    onSale: true,
    saleStartDate: { $lte: now },
    saleEndDate: { $gte: now },
  })
  .sort({ 'discountPercentage': -1 })
  .limit(limit);
};

// Check if model exists before creating
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema); 