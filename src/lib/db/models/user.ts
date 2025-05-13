import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface Address {
  type: 'billing' | 'shipping';
  isDefault: boolean;
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Notification {
  type: 'order' | 'product' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: Date;
}

export type UserRole = 'user' | 'admin' | 'vendor';
export type UserStatus = 'active' | 'inactive' | 'suspended';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    emailVerified: { type: Boolean, default: false },
    provider: { type: String }, // 'credentials', 'google', 'facebook'
    providerId: { type: String },
    addresses: [{
      type: { type: String, enum: ['billing', 'shipping'], required: true },
      isDefault: { type: Boolean, default: false },
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    }],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    notifications: [{
      type: { type: String, enum: ['order', 'product', 'system'], required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      data: { type: mongoose.Schema.Types.Mixed },
      createdAt: { type: Date, default: Date.now },
    }],
    preferences: {
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' },
      newsletter: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: true },
    },
    vendorProfile: {
      storeName: { type: String },
      description: { type: String },
      logo: { type: String },
      banner: { type: String },
      socialLinks: {
        website: { type: String },
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
      },
      paymentInfo: {
        type: { type: String }, // 'stripe', 'paypal'
        accountId: { type: String },
      },
    },
    metadata: {
      type: Map,
      of: String,
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'vendorProfile.storeName': 1 });

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to safely return user data without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Method to add address
userSchema.methods.addAddress = async function(address: Address) {
  if (address.isDefault) {
    // Remove default flag from other addresses of same type
    this.addresses.forEach((addr: Address) => {
      if (addr.type === address.type) {
        addr.isDefault = false;
      }
    });
  }
  this.addresses.push(address);
  return this.save();
};

// Method to add to wishlist
userSchema.methods.addToWishlist = async function(productId: string) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    await this.save();
  }
  return this.wishlist;
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = async function(productId: string) {
  this.wishlist = this.wishlist.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== productId
  );
  await this.save();
  return this.wishlist;
};

// Method to add notification
userSchema.methods.addNotification = async function(notification: Notification) {
  this.notifications.unshift({
    ...notification,
    createdAt: new Date(),
  });
  
  // Keep only last 50 notifications
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(0, 50);
  }
  
  return this.save();
};

// Method to mark notifications as read
userSchema.methods.markNotificationsAsRead = async function() {
  this.notifications.forEach((notification: Notification) => {
    notification.read = true;
  });
  return this.save();
};

// Static method to find by email with password
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to find active vendors
userSchema.statics.findActiveVendors = function(limit = 10) {
  return this.find({
    role: 'vendor',
    status: 'active',
    'vendorProfile.storeName': { $exists: true },
  })
  .select('vendorProfile name email')
  .limit(limit);
};

// Check if model exists before creating
export const User = mongoose.models.User || mongoose.model("User", userSchema); 