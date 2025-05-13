"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HomeContentProps {
  session: any;
}

export function HomeContent({ session }: HomeContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nexora E-commerce</h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-gray-600">
                  Welcome, {session.user.name}
                </span>
                <Button asChild>
                  <Link href="/api/auth/signout">Sign out</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Welcome to Nexora E-commerce
          </h2>
          <p className="text-xl text-gray-600">
            Your one-stop shop for all your needs
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-xl font-semibold">Shop Products</h3>
            <p className="mb-4 text-gray-600">
              Browse our wide selection of products
            </p>
            <Button asChild>
              <Link href="/products">View Products</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-xl font-semibold">Your Orders</h3>
            <p className="mb-4 text-gray-600">
              Track and manage your orders
            </p>
            <Button asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-xl font-semibold">Your Cart</h3>
            <p className="mb-4 text-gray-600">
              Review and checkout your items
            </p>
            <Button asChild>
              <Link href="/cart">View Cart</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
} 