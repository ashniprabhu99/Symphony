import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ProductReviewsProps {
  productHandle: string;
}

const reviewSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name" })
    .max(60, { message: "Name must be under 60 characters" }),
  rating: z.number().int().min(1, { message: "Please pick a rating" }).max(5),
  body: z
    .string()
    .trim()
    .min(1, { message: "Please write your review" })
    .max(2000, { message: "Review must be under 2000 characters" }),
});

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
}

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= value ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ProductReviews({ productHandle }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productHandle],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, author_name, rating, body, created_at")
        .eq("product_handle", productHandle)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async (input: { author_name: string; rating: number; body: string }) => {
      const { error } = await supabase
        .from("product_reviews")
        .insert({ ...input, product_handle: productHandle });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for your review!");
      setName("");
      setRating(0);
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productHandle] });
    },
    onError: () => toast.error("Could not submit your review. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ author_name: name, rating, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    submitReview(parsed.data);
  };

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Customer reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(average)} />
            <span>
              {average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Write a review
          </h3>

          <div className="space-y-2">
            <Label htmlFor="review-rating">Rating</Label>
            <div id="review-rating" className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Rate ${i} star${i === 1 ? "" : "s"}`}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i <= (hovered || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-name">Your name</Label>
            <Input
              id="review-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane D."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-body">Your review</Label>
            <Textarea
              id="review-body"
              value={body}
              maxLength={2000}
              rows={5}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you think of this product?"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit review
          </Button>
        </form>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{review.author_name}</span>
                  <time className="text-xs text-muted-foreground" dateTime={review.created_at}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </time>
                </div>
                <Stars value={review.rating} className="mt-1" />
                <p className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">
                  {review.body}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
