"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/product-card";
import { Heart, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_OPTIONS = [
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Books", slug: "books" },
  { name: "Home & Garden", slug: "home" },
  { name: "Sports & Fitness", slug: "sports" },
  { name: "Phones", slug: "phones" },
  { name: "Watches", slug: "watches" },
  { name: "Cameras", slug: "cameras" },
];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [showPostProduct, setShowPostProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: "",
    imageFiles: [] as File[],
  });
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      fetchAddresses();
      fetchPreferences();
      fetchWishlist();
    }
    // eslint-disable-next-line
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/address");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {}
  };

  const fetchPreferences = async () => {
    // Optionally fetch preferences if you want to sync notification toggle
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist || []);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  // Handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update profile");
      setMessage("Profile updated!");
      update(); // Refresh session
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setMessage("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    }
    setLoading(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add address");
      setAddresses(data.addresses || []);
      setShowAddressForm(false);
      setAddressForm({
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
      });
      setMessage("Address added!");
    } catch (err: any) {
      setError(err.message || "Failed to add address");
    }
    setLoading(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete address");
      setAddresses(data.addresses || []);
      setMessage("Address deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete address");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete account");
      setMessage("Account deleted!");
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    }
    setLoading(false);
  };

  const handleToggleNotifications = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: !notifications }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update preferences");
      setNotifications((prev) => !prev);
      setMessage("Preferences updated!");
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
    }
    setLoading(false);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove from wishlist");
      setWishlist(wishlist.filter(item => item._id !== productId));
      setMessage("Item removed from wishlist!");
    } catch (err: any) {
      setError(err.message || "Failed to remove from wishlist");
    }
    setLoading(false);
  };

  const handlePostProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductLoading(true);
    setMessage(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("category", productForm.category);
      // Append image files
      if (productForm.imageFiles && productForm.imageFiles.length > 0) {
        for (const file of productForm.imageFiles) {
          formData.append("images", file);
        }
      }
      // Append image URLs
      if (productForm.images) {
        for (const url of productForm.images.split(",").map((img) => img.trim()).filter(Boolean)) {
          formData.append("imageUrls", url);
        }
      }
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post product");
      setMessage("Product posted!");
      setProductForm({ name: "", description: "", price: "", category: "", images: "", imageFiles: [] });
      setShowPostProduct(false);
    } catch (err: any) {
      setError(err.message || "Failed to post product");
    }
    setProductLoading(false);
  };

  // Placeholder for wishlist, profile picture, preferences

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileUpdate}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={email} disabled />
              </div>
              <Button type="submit" disabled={loading}>Update Profile</Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" name="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading}>Change Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Shipping Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setShowAddressForm(!showAddressForm)}>
                {showAddressForm ? "Cancel" : "Add New Address"}
              </Button>
              {showAddressForm && (
                <form className="space-y-2" onSubmit={handleAddAddress}>
                  <Input placeholder="Full Name" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} required />
                  <Input placeholder="Address" value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} required />
                  <Input placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                  <Input placeholder="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} required />
                  <Input placeholder="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} required />
                  <Input placeholder="Country" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} required />
                  <Input placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                  <Button type="submit" disabled={loading}>Save Address</Button>
                </form>
              )}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No addresses added yet.</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div key={idx} className="border rounded p-2 flex justify-between items-center">
                      <div>
                        <div>{addr.fullName}</div>
                        <div>{addr.address}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}</div>
                        <div>{addr.phone}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(addr._id || idx)} disabled={loading}>Delete</Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive order updates and promotions</p>
                </div>
                <Button variant={notifications ? "default" : "outline"} onClick={handleToggleNotifications} disabled={loading}>
                  {notifications ? "On" : "Off"}
                </Button>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleDeleteAccount} disabled={loading}>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Wishlist Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <div key={product._id} className="relative group">
                    <ProductCard product={product} />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mb-8">
        <Button onClick={() => setShowPostProduct((v) => !v)}>
          {showPostProduct ? "Cancel" : "Post Product"}
        </Button>
        {showPostProduct && (
          <form className="mt-4 space-y-4 p-4 border rounded bg-white" onSubmit={handlePostProduct} encType="multipart/form-data">
            <div>
              <Label htmlFor="product-name">Name</Label>
              <Input id="product-name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="product-price">Price</Label>
              <Input id="product-price" type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                className="w-full border rounded px-3 py-2"
                value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="product-images">Image URLs (comma separated)</Label>
              <Input id="product-images" value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="product-image-files">Upload Images</Label>
              <Input id="product-image-files" type="file" multiple accept="image/*" onChange={e => setProductForm({ ...productForm, imageFiles: e.target.files ? Array.from(e.target.files) : [] })} />
            </div>
            <Button type="submit" disabled={productLoading}>Submit</Button>
          </form>
        )}
      </div>
    </div>
  );
} 