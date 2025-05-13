"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

interface QuickViewProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
    description?: string;
    category?: string;
    stock?: number;
    ratings: {
      average: number;
      count: number;
    };
  };
}

export function QuickView({ product }: QuickViewProps) {
  const { addItem } = useCart();
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          {product.category && (
            <p className="text-sm text-muted-foreground">{product.category}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(product.ratings.average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.ratings.count} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
          {product.comparePrice && (
            <>
              <p className="text-lg text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </p>
              <p className="text-sm font-medium text-green-600">
                Save {discount}%
              </p>
            </>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        {product.stock !== undefined && (
          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In Stock ({product.stock})</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>
        )}

        <Button
          className="mt-4"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
} 