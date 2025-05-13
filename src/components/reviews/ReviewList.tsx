"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images: { url: string; alt: string }[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  response?: {
    comment: string;
    user: {
      name: string;
      image?: string;
    };
    createdAt: string;
  };
}

interface ReviewListProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewList({ productId, initialReviews = [] }: ReviewListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews?productId=${productId}&page=${pageNum}&limit=5`
      );
      const data = await response.json();
      
      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
      
      setHasMore(data.reviews.length === 5);
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

  useEffect(() => {
    fetchReviews(1);
  }, [productId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please sign in to mark reviews as helpful",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          helpful: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to update review");

      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      });
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please sign in to report reviews",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reported: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to report review");

      toast({
        title: "Success",
        description: "Review has been reported for moderation",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report review",
        variant: "destructive",
      });
    }
  };

  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={review.user.image} />
                <AvatarFallback>
                  {review.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{review.user.name}</h4>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 mt-1">
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
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(review._id)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {review.helpful}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReport(review._id)}
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {review.title && (
            <h5 className="font-medium mt-3">{review.title}</h5>
          )}
          <p className="mt-2 text-gray-600">{review.comment}</p>

          {review.images.length > 0 && (
            <div className="flex space-x-2 mt-3">
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

          {review.response && (
            <div className="mt-4 ml-12 bg-gray-50 p-4 rounded">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={review.response.user.image} />
                  <AvatarFallback>
                    {review.response.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.response.user.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.response.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{review.response.comment}</p>
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  );
} 