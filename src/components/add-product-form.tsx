"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [onSale, setOnSale] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const price = parseFloat(formData.get("price") as string);
      const salePrice = onSale ? parseFloat(formData.get("salePrice") as string) : null;

      // Validate sale price is less than regular price
      if (onSale && salePrice && salePrice >= price) {
        toast.error("Sale price must be less than regular price");
        return;
      }

      const data = {
        name: formData.get("name"),
        description: formData.get("description"),
        price,
        category: formData.get("category"),
        image: formData.get("image"),
        stock: parseInt(formData.get("stock") as string),
        onSale,
        salePrice,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add product");
      }

      const product = await response.json();
      
      toast.success("Product added successfully!");
      router.push(`/products/${product.slug}`);
      router.refresh();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input 
          id="name" 
          name="name" 
          required 
          placeholder="Enter product name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          required 
          placeholder="Enter product description"
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="cameras">Cameras</SelectItem>
            <SelectItem value="watches">Watches</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input 
          id="image" 
          name="image" 
          type="url" 
          required 
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="onSale"
          checked={onSale}
          onCheckedChange={setOnSale}
        />
        <Label htmlFor="onSale">On Sale</Label>
      </div>

      {onSale && (
        <div className="space-y-2">
          <Label htmlFor="salePrice">Sale Price ($)</Label>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding Product..." : "Add Product"}
      </Button>
    </form>
  );
} 