DROP POLICY IF EXISTS "Anyone can submit a review" ON public.product_reviews;

CREATE POLICY "Anyone can submit a valid review"
ON public.product_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  rating BETWEEN 1 AND 5
  AND length(btrim(product_handle)) BETWEEN 1 AND 200
  AND length(btrim(author_name)) BETWEEN 1 AND 60
  AND length(btrim(body)) BETWEEN 1 AND 2000
);