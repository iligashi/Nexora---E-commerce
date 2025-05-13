import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";

async function getDeals() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?onSale=true`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch deals");
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching deals:", error);
    return [];
  }
}

export default async function DealsPage() {
  const products = await getDeals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Hot Deals</h1>
        <Badge variant="destructive" className="text-lg py-1">
          Sale
        </Badge>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600">
            No deals available at the moment
          </h2>
          <p className="text-gray-500 mt-2">
            Check back later for amazing discounts!
          </p>
        </div>
      )}
    </div>
  );
} 