import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usedBy: mongoose.Types.ObjectId[];
  usageLimit: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    minPurchase: { type: Number, required: true },
    maxDiscount: Number,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    usageLimit: { type: Number, default: 0 }, // 0 means unlimited
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Validate dates
couponSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Validate discount based on type
couponSchema.pre('save', function(next) {
  if (this.type === 'percentage' && this.discount > 100) {
    next(new Error('Percentage discount cannot be greater than 100'));
  }
  next();
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === 0 || this.usageCount < this.usageLimit)
  );
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(amount: number): number {
  if (!this.isValid()) return 0;

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.discount) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discount;
  }

  return discount;
};

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema); 