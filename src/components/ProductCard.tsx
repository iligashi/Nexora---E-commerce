"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  onSale: boolean;
  salePrice?: number;
  slug: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.onSale ? product.salePrice! : product.price,
      image: product.image,
      quantity: 1,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`} className="block aspect-square relative">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.onSale && (
          <Badge
            variant="destructive"
            className="absolute top-4 right-4 px-2 py-0.5"
          >
            Sale
          </Badge>
        )}
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-lg truncate group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            <Star className="fill-current h-4 w-4" />
            <span className="ml-1 text-sm">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({product.numReviews} reviews)
          </span>
        </div>

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
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
          variant="secondary"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
} 