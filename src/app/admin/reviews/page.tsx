"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    image: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images: { url: string; alt: string }[];
  status: "pending" | "approved" | "rejected";
  reported: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [response, setResponse] = useState("");
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== "admin") {
      router.push("/auth/signin");
      return;
    }

    fetchReviews();
  }, [session, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?status=${filter}`);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, status: string) => {
    try {
      const reviewResponse = response.trim();
      const payload: any = { status };
      
      if (status === "rejected" && reviewResponse) {
        payload.response = {
          comment: reviewResponse,
          user: {
            name: session?.user?.name,
            image: session?.user?.image,
          },
        };
      }

      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update review");

      toast({
        title: "Success",
        description: `Review ${status} successfully`,
      });

      setReviews(reviews.filter((review) => review._id !== reviewId));
      setSelectedReview(null);
      setResponse("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter((review) =>
    search
      ? review.user.name.toLowerCase().includes(search.toLowerCase()) ||
        review.product.name.toLowerCase().includes(search.toLowerCase()) ||
        review.comment.toLowerCase().includes(search.toLowerCase())
      : true
  );

  if (!session || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>

      <div className="flex gap-4 mb-6">
        <Select
          value={filter}
          onValueChange={setFilter}
          className="w-40"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="reported">Reported</option>
        </Select>

        <Input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{review.product.name}</h3>
                <p className="text-sm text-gray-500">
                  by {review.user.name} • {review.user.email}
                </p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {review.reported && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Reported
                </span>
              )}
            </div>

            {review.title && (
              <h4 className="font-medium mt-3">{review.title}</h4>
            )}
            <p className="mt-2 text-gray-600">{review.comment}</p>

            {review.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="mt-4">
              {selectedReview === review._id ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Add a response (optional for rejection)"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange(review._id, "approved")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(review._id, "rejected")}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedReview(null);
                        setResponse("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedReview(review._id)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Moderate
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <p className="text-center text-gray-500">No reviews found</p>
        )}
      </div>
    </div>
  );
} 