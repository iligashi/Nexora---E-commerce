const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    name: "iPhone 14 Pro",
    description: "Latest iPhone with amazing camera features",
    price: 999.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&auto=format&fit=crop",
    slug: "iphone-14-pro",
    stock: 10,
    onSale: false
  },
  {
    name: "MacBook Air M2",
    description: "Powerful and portable laptop with M2 chip",
    price: 1299.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
    slug: "macbook-air-m2",
    stock: 5,
    onSale: true,
    salePrice: 1199.99
  },
  {
    name: "Nike Air Max",
    description: "Comfortable running shoes for everyday use",
    price: 129.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
    slug: "nike-air-max",
    stock: 15,
    onSale: false
  },
  {
    name: "Sony WH-1000XM4",
    description: "Premium noise-cancelling headphones",
    price: 349.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop",
    slug: "sony-wh-1000xm4",
    stock: 8,
    onSale: true,
    salePrice: 299.99
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing products
    await Product.deleteMany({});
    console.log('Deleted existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProducts(); 