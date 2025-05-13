import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  quantity: number;
  sold: number;
  tags: string[];
  ratings: {
    star: number;
    comment: string;
    postedBy: mongoose.Types.ObjectId;
  }[];
  totalRating: number;
  vendor: mongoose.Types.ObjectId;
  isFeatured: boolean;
  isActive: boolean;
  attributes: {
    name: string;
    value: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: Number,
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    subcategory: String,
    brand: {
      type: String,
      required: [true, "Product brand is required"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    ratings: [
      {
        star: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        postedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    totalRating: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: [
      {
        name: String,
        value: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from name
productSchema.pre("save", function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  next();
});

// Calculate total rating
productSchema.methods.calculateTotalRating = function () {
  if (this.ratings.length === 0) {
    this.totalRating = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, rating) => acc + rating.star, 0);
  this.totalRating = sum / this.ratings.length;
};

// Create indexes for better query performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema); 