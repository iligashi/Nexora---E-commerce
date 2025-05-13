import mongoose from "mongoose";

export interface ReviewImage {
  url: string;
  alt: string;
}

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{
      url: { type: String, required: true },
      alt: { type: String },
    }],
    verified: { type: Boolean, default: false }, // Verified purchase
    helpful: { type: Number, default: 0 }, // Number of helpful votes
    reported: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    response: {
      comment: { type: String },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Update product rating when review is saved
reviewSchema.post("save", async function() {
  const Review = this.constructor;
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: this.product, status: "approved" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      rating: 0,
      numReviews: 0,
    });
  }
});

// Static method to get product reviews with pagination
reviewSchema.statics.getProductReviews = async function(
  productId: string,
  page = 1,
  limit = 10,
  sort = { createdAt: -1 }
) {
  return this.find({
    product: productId,
    status: "approved",
  })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name image");
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = async function(
  userId: string,
  page = 1,
  limit = 10
) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("product", "name image price");
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductStats = async function(productId: string) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        rating: "$_id",
        count: 1,
        _id: 0,
      },
    },
    { $sort: { rating: -1 } },
  ]);
};

// Check if model exists before creating
export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema); 