"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuickView } from "./quick-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    slug: string;
    rating: number;
    numReviews: number;
    onSale: boolean;
    salePrice?: number;
    currentPrice?: number;
    images: string[];
  };
  isInWishlist?: boolean;
  onWishlistChange?: () => void;
}

export function ProductCard({ product, isInWishlist = false, onWishlistChange }: ProductCardProps) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.currentPrice || product.price,
      image: product.images && product.images[currentImageIndex],
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      
      if (!res.ok) throw new Error("Failed to update wishlist");
      
      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    // Try next image if available
    if (product.images && currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageError(false);
    }
  };

  const hasImages = product.images && product.images.length > 0 && product.images.some((img: string) => !!img);
  const currentImage = hasImages ? product.images[currentImageIndex] : null;

  return (
    <Card className="group overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square">
            {hasImages && currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg" />
            )}
            {product.onSale && (
              <Badge
                variant="destructive"
                className="absolute top-2 right-2 px-2 py-0.5"
              >
                Sale
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleWishlistToggle}
              disabled={loading}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </Button>
          </div>
        </Link>
      </div>
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-500 mb-2">
            <Star className="fill-current h-4 w-4" />
            <span>{product.rating}</span>
            <span className="text-gray-500">({product.numReviews})</span>
          </div>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.onSale ? (
              <>
                <span className="font-bold text-lg">${product.salePrice}</span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="font-bold text-lg">${product.price}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="ml-auto"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 