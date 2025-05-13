import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface Product {
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
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.onSale && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 px-2 py-0.5"
            >
              Sale
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-500 mb-2">
            <Star className="fill-current h-4 w-4" />
            <span>{product.rating}</span>
            <span className="text-gray-500">({product.numReviews})</span>
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
        </CardContent>
      </Card>
    </Link>
  );
} 