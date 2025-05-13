"use client";

import { useState } from "react"
import { useCart } from "@/lib/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

type Step = "shipping" | "payment" | "review"

interface ShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
}

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>("shipping")
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    zipCode: "",
    country: "",
    email: "",
    phone: "",
  })
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("review")
  }

  const handleCheckoutComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Map cart items to backend format
      const mappedItems = items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Compose shipping object for backend
      const shipping = {
        firstName: shippingDetails.firstName,
        lastName: shippingDetails.lastName,
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zipCode: shippingDetails.postalCode || shippingDetails.zipCode,
        email: shippingDetails.email,
      };

      const order = {
        items: mappedItems,
        total,
        shipping,
        status: "pending"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      clearCart()
      router.push("/checkout/success")
    } catch (error) {
      console.error("Checkout error:", error)
      // Handle error (show error message to user)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {["shipping", "payment", "review"].map((s) => (
          <div
            key={s}
            className={`flex-1 text-center ${
              step === s ? "text-primary font-medium" : "text-gray-400"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {/* Shipping Form */}
      {step === "shipping" && (
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={shippingDetails.firstName}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, firstName: e.target.value })
            }
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={shippingDetails.lastName}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, lastName: e.target.value })
            }
            required
          />
          <Input
            type="text"
            placeholder="Address"
            value={shippingDetails.address}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, address: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="City"
              value={shippingDetails.city}
              onChange={(e) =>
                setShippingDetails({ ...shippingDetails, city: e.target.value })
              }
              required
            />
            <Input
              type="text"
              placeholder="State"
              value={shippingDetails.state}
              onChange={(e) =>
                setShippingDetails({ ...shippingDetails, state: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Postal Code"
              value={shippingDetails.postalCode}
              onChange={(e) =>
                setShippingDetails({
                  ...shippingDetails,
                  postalCode: e.target.value,
                })
              }
              required
            />
            <Input
              type="text"
              placeholder="Zip Code"
              value={shippingDetails.zipCode}
              onChange={(e) =>
                setShippingDetails({
                  ...shippingDetails,
                  zipCode: e.target.value,
                })
              }
              required
            />
          </div>
          <Input
            type="text"
            placeholder="Country"
            value={shippingDetails.country}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, country: e.target.value })
            }
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={shippingDetails.email}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, email: e.target.value })
            }
            required
          />
          <Input
            type="tel"
            placeholder="Phone"
            value={shippingDetails.phone}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, phone: e.target.value })
            }
            required
          />
          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </form>
      )}

      {/* Payment Form */}
      {step === "payment" && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Card Number"
            value={paymentDetails.cardNumber}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                cardNumber: e.target.value,
              })
            }
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="MM/YY"
              value={paymentDetails.expiryDate}
              onChange={(e) =>
                setPaymentDetails({
                  ...paymentDetails,
                  expiryDate: e.target.value,
                })
              }
              required
              className="col-span-2"
            />
            <Input
              type="text"
              placeholder="CVV"
              value={paymentDetails.cvv}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, cvv: e.target.value })
              }
              required
            />
          </div>
          <Input
            type="text"
            placeholder="Cardholder Name"
            value={paymentDetails.cardholderName}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                cardholderName: e.target.value,
              })
            }
            required
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("shipping")}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Review Order
            </Button>
          </div>
        </form>
      )}

      {/* Review */}
      {step === "review" && (
        <form onSubmit={handleCheckoutComplete} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Shipping Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
              <p>{shippingDetails.address}</p>
              <p>
                {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
              </p>
              <p>{shippingDetails.country}</p>
              <p>{shippingDetails.email}</p>
              <p>{shippingDetails.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Payment Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                Card ending in {paymentDetails.cardNumber.slice(-4)}
              </p>
              <p>{paymentDetails.cardholderName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("payment")}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Place Order
            </Button>
          </div>
        </form>
      )}
    </div>
  )
} 