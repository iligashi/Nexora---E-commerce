import mongoose from "mongoose";

export interface CategoryImage {
  url: string;
  alt: string;
}

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: {
      url: { type: String },
      alt: { type: String },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    level: { type: Number, default: 0 }, // 0 for root categories
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    featuredOrder: { type: Number }, // For featured categories, null if not featured
    metadata: {
      icon: { type: String }, // Icon class or URL
      color: { type: String }, // Hex color code
      bannerImage: { type: String }, // URL for category banner
    },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ featuredOrder: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for products count
categorySchema.virtual("productsCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Method to get full path (breadcrumb)
categorySchema.methods.getPath = async function() {
  const path = [this];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (!current) break;
    path.unshift(current);
  }

  return path;
};

// Static method to get category tree
categorySchema.statics.getTree = async function(parentId = null, maxLevel = 3) {
  const categories = await this.find({
    parent: parentId,
    level: { $lt: maxLevel },
    isActive: true,
  })
    .sort({ sortOrder: 1 })
    .lean();

  for (let category of categories) {
    category.subcategories = await this.getTree(category._id, maxLevel);
  }

  return categories;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = async function(limit = 6) {
  return this.find({
    isActive: true,
    featuredOrder: { $ne: null },
  })
    .sort({ featuredOrder: 1 })
    .limit(limit)
    .populate("productsCount");
};

// Static method to get categories with product counts
categorySchema.statics.getWithProductCounts = async function(conditions = {}) {
  return this.find({ ...conditions, isActive: true })
    .sort({ sortOrder: 1 })
    .populate("productsCount");
};

// Check if model exists before creating
export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema); 