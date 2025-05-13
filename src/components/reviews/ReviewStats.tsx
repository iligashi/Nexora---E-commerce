"use client";

import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReviewStat {
  rating: number;
  count: number;
}

interface ReviewStatsProps {
  stats: ReviewStat[];
  totalReviews: number;
  averageRating: number;
}

export function ReviewStats({ stats, totalReviews, averageRating }: ReviewStatsProps) {
  // Create an array of all ratings (1-5) with their counts
  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const stat = stats.find((s) => s.rating === i + 1);
    return stat ? stat.count : 0;
  }).reverse(); // Reverse to show 5 stars first

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Average Rating */}
      <div className="text-center md:text-left">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="flex items-center justify-center md:justify-start mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(averageRating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {ratingCounts.map((count, i) => {
          const rating = 5 - i;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-16 text-sm">
                <span>{rating}</span>
                <Star className="w-4 h-4 text-gray-400 ml-1" />
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="w-12 text-sm text-gray-500 text-right">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 