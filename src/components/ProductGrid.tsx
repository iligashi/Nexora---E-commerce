"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  numReviews: number;
  stock: number;
  onSale: boolean;
  salePrice?: number;
  slug: string;
}

export default function ProductGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Build the query string from search params
        const queryParams = new URLSearchParams();
        if (searchParams.search) queryParams.set("search", searchParams.search);
        if (searchParams.category) queryParams.set("category", searchParams.category);
        if (searchParams.sort) queryParams.set("sort", searchParams.sort);

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams]);

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
} 