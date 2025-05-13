"use client";

import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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

export default function ProductDetails({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        
        // Log the request details
        const apiUrl = `/api/products/${params.slug}`;
        console.log('Fetching product from:', apiUrl);
        
        const res = await fetch(apiUrl);
        console.log('Response status:', res.status);
        
        const contentType = res.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error response:', errorText);
          
          let errorMessage = 'Failed to fetch product';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the raw error text
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log('Product data:', data);
        
        if (!data || !data.name) {
          throw new Error("Invalid product data received");
        }
        
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to load product");
        toast.error("Failed to load product. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Product</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.onSale ? product.salePrice! : product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
          {product.onSale && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 px-2 py-0.5"
            >
              Sale
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              <Star className="fill-current h-5 w-5" />
              <span className="ml-1">{product.rating}</span>
            </div>
            <span className="text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-4">
            {product.onSale ? (
              <>
                <span className="text-3xl font-bold">${product.salePrice}</span>
                <span className="text-xl text-gray-500 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">${product.price}</span>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <Badge variant="secondary">{product.category}</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Stock Status</h3>
            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
              {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
            </Badge>
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
} 