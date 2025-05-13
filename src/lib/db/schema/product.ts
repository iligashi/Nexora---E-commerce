import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  quantity: number;
  ratings: {
    user: mongoose.Types.ObjectId;
    rating: number;
    review?: string;
  }[];
  averageRating: number;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, required: true, min: 0 },
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: String,
    }],
    averageRating: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate average rating before saving
productSchema.pre("save", function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product; 