import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product";
import { ObjectId } from "mongodb";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x600?text=No+Image";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('GET /api/products/[slug] - Starting request');
    console.log('Slug parameter:', params.slug);
    
    if (!params.slug) {
      console.error('No slug provided');
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database successfully');
    
    let query = {};
    
    // Check if the slug is a valid ObjectId
    if (ObjectId.isValid(params.slug)) {
      console.log('Using ObjectId query');
      query = { _id: new ObjectId(params.slug) };
    } else {
      console.log('Using slug query');
      query = { 
        slug: params.slug.toLowerCase(),
        isActive: true 
      };
    }
    
    console.log('Executing query:', JSON.stringify(query));
    
    const product = await Product.findOne(query);
    
    if (!product) {
      console.log('Product not found for:', params.slug);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log('Product found:', {
      id: product._id,
      name: product.name,
      slug: product.slug
    });

    // Process images to ensure they're valid URLs
    if (product.images && product.images.length > 0) {
      // Filter out any invalid image URLs and ensure they're absolute URLs
      product.images = product.images
        .filter((img: string) => img && typeof img === 'string')
        .map((img: string) => {
          // If the image URL is relative, make it absolute using the API URL
          if (img.startsWith('/')) {
            return `${process.env.NEXT_PUBLIC_API_URL}${img}`;
          }
          return img;
        });
    }

    // If no valid images, use placeholder
    if (!product.images || product.images.length === 0) {
      product.images = [PLACEHOLDER_IMAGE];
    }

    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error in GET /api/products/[slug]:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    
    const product = await Product.findOneAndUpdate(
      { slug: params.slug },
      { ...body },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const product = await Product.findOneAndUpdate(
      { slug: params.slug },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
} 