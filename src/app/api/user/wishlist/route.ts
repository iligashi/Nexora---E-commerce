import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user";

// Get wishlist items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const user = await User.findById(session.user.id).populate("wishlist");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ wishlist: user.wishlist || [] });
}

// Add item to wishlist
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const { productId } = await request.json();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
  // Check if product already in wishlist
  if (user.wishlist.includes(productId)) {
    return NextResponse.json({ error: "Product already in wishlist" }, { status: 400 });
  }
  
  user.wishlist.push(productId);
  await user.save();
  return NextResponse.json({ wishlist: user.wishlist });
}

// Remove item from wishlist
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const { productId } = await request.json();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
  user.wishlist = user.wishlist.filter((id: string) => id.toString() !== productId);
  await user.save();
  return NextResponse.json({ wishlist: user.wishlist });
} 