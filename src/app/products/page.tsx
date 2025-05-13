import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import ProductGrid from "@/components/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

async function getProducts() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
    console.log('Fetching products from:', apiUrl);

    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Products fetched:', data);
    return data.products || []; // Ensure we return an array
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-[200px] w-full bg-gray-200 animate-pulse rounded-lg" />
      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const products = await getProducts();
  console.log('Rendered products:', products);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      <div className="flex items-center gap-4 w-full">
        <form className="hidden md:block flex-1">
          <input
            type="search"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-full border bg-background"
          />
        </form>
        {/* ...icons here... */}
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
} 