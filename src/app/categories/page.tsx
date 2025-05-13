import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Laptop,
  Shirt,
  Book,
  Home,
  Dumbbell,
  Smartphone,
  Watch,
  Camera,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    icon: Laptop,
    href: "/products?category=electronics",
    color: "bg-blue-500",
  },
  {
    name: "Clothing",
    icon: Shirt,
    href: "/products?category=clothing",
    color: "bg-pink-500",
  },
  {
    name: "Books",
    icon: Book,
    href: "/products?category=books",
    color: "bg-yellow-500",
  },
  {
    name: "Home & Garden",
    icon: Home,
    href: "/products?category=home",
    color: "bg-green-500",
  },
  {
    name: "Sports & Fitness",
    icon: Dumbbell,
    href: "/products?category=sports",
    color: "bg-purple-500",
  },
  {
    name: "Phones",
    icon: Smartphone,
    href: "/products?category=phones",
    color: "bg-red-500",
  },
  {
    name: "Watches",
    icon: Watch,
    href: "/products?category=watches",
    color: "bg-indigo-500",
  },
  {
    name: "Cameras",
    icon: Camera,
    href: "/products?category=cameras",
    color: "bg-orange-500",
  },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.name} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`p-4 rounded-full ${category.color} bg-opacity-10`}
                    >
                      <Icon
                        className={`w-8 h-8 ${category.color} text-opacity-90`}
                      />
                    </div>
                    <h3 className="text-lg font-medium text-center">
                      {category.name}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 