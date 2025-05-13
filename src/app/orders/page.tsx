import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function getOrders() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/orders")
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
    credentials: 'include',
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch orders")
  }

  return res.json()
}

export default async function OrdersPage() {
  const { orders } = await getOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Order History</h1>
      {orders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-4 text-gray-600">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="rounded-lg border p-6 transition-colors hover:bg-gray-50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {format(new Date(order.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                  <p
                    className={`text-sm ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="mb-2 font-medium">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <Link href={`/orders/${order._id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 