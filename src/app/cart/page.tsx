import React from "react";
import { Cart } from "@/components/cart";
import { CartProvider } from "@/context/cart-context";

export default function CartPage() {
  return (
    <CartProvider>
      <main className="container mx-auto py-8">
        <Cart />
      </main>
    </CartProvider>
  );
} 