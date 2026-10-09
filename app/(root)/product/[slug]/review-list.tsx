
'use client';

import { Review } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";
import { getReviews } from "@/lib/actions/review.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data])
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Review form */}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div className="text-center">
          Please
          <Link
            className="px-2 text-blue-700 hover:underline"
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review.
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>{review.title}</CardTitle>
                <CardDescription>{review.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <Rating value={review.rating} />

                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    {review.user ? review.user.name : "User"}
                  </div>

                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDateTime(review.createdAt).dateTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
