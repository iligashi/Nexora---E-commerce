import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product";

export async function GET(request: Request) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database successfully');
    
    const { searchParams } = new URL(request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build the filter query
    let filterQuery: any = { isActive: true };
    
    // Add text search if query exists
    if (query) {
      filterQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Add category filter if specified
    if (category && category !== 'all') {
      filterQuery.category = category;
    }

    console.log('Filter query:', filterQuery);

    // Build sort options
    let sortOptions: any = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'price-low':
        sortOptions = { price: 1 }; // Changed from currentPrice to price
        break;
      case 'price-high':
        sortOptions = { price: -1 }; // Changed from currentPrice to price
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    console.log('Sort options:', sortOptions);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments(filterQuery);
    console.log('Total products found:', total);

    // Get products
    const products = await Product.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    console.log('Products fetched:', products.length);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 