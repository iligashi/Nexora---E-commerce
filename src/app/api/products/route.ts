// app/api/products/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product";
import { Category } from "@/lib/db/models/category";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

// Needed to avoid Next.js from trying to parse body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse FormData using formidable
async function parseFormData(req: Request): Promise<{ fields: any; files: any }> {
  const form = formidable({
    multiples: true,
    uploadDir: path.join(process.cwd(), "public/uploads"),
    keepExtensions: true,
  });

  // Convert the native Request into a stream for formidable
  const buffer = await req.arrayBuffer();
  const stream = require("stream");
  const readable = new stream.Readable();
  readable._read = () => {}; // No-op
  readable.push(Buffer.from(buffer));
  readable.push(null);

  return new Promise((resolve, reject) => {
    form.parse(readable as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    await connectToDatabase();

    const query: any = { isActive: true };

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return NextResponse.json({ products: [], total: 0, page, totalPages: 0 });
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { fields, files } = await parseFormData(request);

    const { name, description, price, category } = fields;
    let images: string[] = [];

    // Handle uploaded images
    if (files?.images) {
      const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];
      images = uploadedFiles.map((file: File) => "/uploads/" + path.basename(file.filepath));
    }

    // Handle image URLs
    if (fields.imageUrls) {
      const urls = Array.isArray(fields.imageUrls) ? fields.imageUrls : [fields.imageUrls];
      images.push(...urls.filter((url: string) => !!url));
    }

    if (!name || !description || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      slug,
      isActive: true,
      user: session.user.id,
    });

    await product.save();
    return NextResponse.json({ product });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
