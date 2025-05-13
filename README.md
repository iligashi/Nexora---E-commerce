# Nexora - Modern E-commerce Platform

A full-featured e-commerce platform built with Next.js 14, TypeScript, and MongoDB.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, MongoDB, Tailwind CSS
- **Authentication**: JWT + OAuth2 (Google, Facebook)
- **Product Management**: Advanced search, filtering, categories
- **Shopping Cart**: Real-time updates, persistent storage
- **Checkout Process**: Stripe and PayPal integration
- **Admin Dashboard**: Full control over products, orders, and users
- **User Profiles**: Order history, wishlist, reviews
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Performance**: SSR/SSG optimization, image optimization
- **Security**: Role-based access control, secure API routes

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin dashboard routes
│   ├── api/               # API routes
│   ├── auth/              # Authentication routes
│   ├── products/          # Product routes
│   └── [...]/             # Other app routes
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── admin/            # Admin components
│   ├── products/         # Product components
│   └── shared/           # Shared components
├── lib/                  # Utility functions
│   ├── db/              # Database utilities
│   ├── auth/            # Auth utilities
│   └── api/             # API utilities
├── hooks/               # Custom React hooks
├── context/            # React Context providers
├── types/              # TypeScript types
└── styles/             # Global styles
```

## 🗄️ Database Schema

```typescript
// User Schema
interface User {
  _id: ObjectId
  name: string
  email: string
  password?: string
  role: 'admin' | 'user' | 'vendor'
  orders: Order[]
  wishlist: Product[]
  reviews: Review[]
  createdAt: Date
  updatedAt: Date
}

// Product Schema
interface Product {
  _id: ObjectId
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  tags: string[]
  stock: number
  rating: number
  numReviews: number
  reviews: Review[]
  onSale: boolean
  salePrice?: number
  vendor: User
  createdAt: Date
  updatedAt: Date
}

// Order Schema
interface Order {
  _id: ObjectId
  user: User
  items: OrderItem[]
  total: number
  status: OrderStatus
  shippingAddress: Address
  paymentMethod: string
  paymentResult?: PaymentResult
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 Design System

- **Colors**: Modern, accessible color palette
- **Typography**: Clean, readable fonts
- **Components**: Consistent shadcn/ui components
- **Animations**: Subtle micro-interactions
- **Dark Mode**: Full dark mode support

## 🛠️ Setup & Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_uri

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public

# Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📦 Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository to Vercel
3. Configure environment variables
4. Deploy!

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [MongoDB](https://www.mongodb.com)
- [Stripe](https://stripe.com) 