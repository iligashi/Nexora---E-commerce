import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

async function getOrder(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/orders")
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`,
    {
      next: { revalidate: 60 },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch order")
  }

  return res.json()
}

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await getOrder(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/orders">← Back to Orders</Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="text-gray-600">
          Order #{order._id.slice(-6).toUpperCase()} • Placed on{" "}
          {format(new Date(order.createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Order Items */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 border-b pb-4"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status & Shipping */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-medium ${
                    order.status === "delivered"
                      ? "text-green-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === "paid"
                      ? "text-green-600"
                      : order.paymentStatus === "failed"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Shipping Information</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">
                  {order.shipping.firstName} {order.shipping.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{order.shipping.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Address</span>
                <span className="font-medium">{order.shipping.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">City</span>
                <span className="font-medium">{order.shipping.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">State</span>
                <span className="font-medium">{order.shipping.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ZIP Code</span>
                <span className="font-medium">{order.shipping.zipCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 