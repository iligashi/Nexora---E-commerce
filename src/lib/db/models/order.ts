import mongoose from "mongoose";

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  email_address?: string;
  update_time: string;
  provider: 'stripe' | 'paypal';
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "paypal"],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      email_address: { type: String },
      update_time: { type: String },
      provider: { type: String, enum: ["stripe", "paypal"] },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "paymentResult.id": 1 });

// Virtual for order total
orderSchema.virtual("total").get(function() {
  return this.itemsPrice + this.shippingPrice + this.taxPrice;
});

// Method to update order status
orderSchema.methods.updateStatus = async function(status: OrderStatus) {
  this.status = status;
  if (status === "delivered") {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  return this.save();
};

// Method to mark as paid
orderSchema.methods.markAsPaid = async function(paymentResult: PaymentResult) {
  this.isPaid = true;
  this.paidAt = new Date();
  this.paymentResult = paymentResult;
  this.status = "processing";
  return this.save();
};

// Static method to get user's orders with pagination
orderSchema.statics.getUserOrders = async function(
  userId: string,
  page = 1,
  limit = 10
) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("items.product", "name price image");
};

// Check if model exists before creating
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema); 