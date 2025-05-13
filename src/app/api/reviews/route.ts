import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/lib/db/models/review";
import { connectToDatabase } from "@/lib/db/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/reviews - Get all reviews (with filtering and pagination)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "-createdAt";

    const query: any = {};
    if (productId) query.product = productId;
    if (userId) query.user = userId;
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name image")
      .populate("product", "name image price");

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const data = await request.json();

    // Validate required fields
    if (!data.product || !data.rating || !data.comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: data.product,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = new Review({
      ...data,
      user: session.user.id,
      status: "pending", // All reviews start as pending for moderation
    });

    await review.save();

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
} 