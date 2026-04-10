'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Check,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StarRating } from '@/components/store/StarRating';
import { useStore } from '@/store';
import type { Product, Review } from '@/types';

interface ProductDetailResponse {
  product: Product;
  reviews: Review[];
}

async function fetchProductDetail(id: number): Promise<ProductDetailResponse> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`size-6 ${
              star <= (hovered || value)
                ? 'fill-emerald-500 text-emerald-500'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductDetailView() {
  const { selectedProductId, setCurrentView, setSelectedProductId, cartId, setCartCount } =
    useStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    rating: 0,
    title: '',
    comment: '',
  });

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetchProductDetail(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      userName: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      const res = await fetch(`/api/products/${selectedProductId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', selectedProductId] });
      toast.success('Review submitted successfully!');
      setReviewDialogOpen(false);
      setReviewForm({ userName: '', rating: 0, title: '', comment: '' });
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });

  const product = data?.product;
  const reviews = data?.reviews || [];

  let images: string[] = [];
  if (product?.images) {
    // API already parses images as a JSON array
    if (Array.isArray(product.images)) {
      images = product.images;
    } else {
      try {
        images = JSON.parse(String(product.images));
      } catch {
        images = [];
      }
    }
  }
  if (product && product.image && !images.includes(product.image)) {
    images.unshift(product.image);
  }

  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = async () => {
    if (!product || addingToCart || product.stock === 0) return;
    setAddingToCart(true);
    try {
      const res = await fetch(`/api/cart/${cartId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.ok) {
        const cart = await res.json();
        setCartCount(cart.items?.length || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success(`${product.name} added to cart`, {
          description: `Quantity: ${quantity} - $${(product.price * quantity).toFixed(2)}`,
        });
      } else {
        toast.error('Failed to add to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = () => {
    if (!reviewForm.userName || reviewForm.rating === 0 || !reviewForm.title || !reviewForm.comment) {
      toast.error('Please fill in all review fields');
      return;
    }
    submitReviewMutation.mutate(reviewForm);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  // API already parses tags as a JSON array
  const tags: string[] = product?.tags
    ? Array.isArray(product.tags)
      ? product.tags
      : String(product.tags).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const discount = product?.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="size-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Package className="size-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button variant="outline" onClick={() => setCurrentView('shop')}>
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setSelectedProductId(null);
            setCurrentView('shop');
          }}
        >
          <ArrowLeft className="size-4" />
          Back to Shop
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border/40 bg-muted/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full"
              >
                <Image
                  src={images[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-red-500 text-white border-0">
                -{discount}% OFF
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    idx === selectedImage
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Category + Version */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.version && (
              <Badge variant="outline" className="border-emerald-600/30 text-emerald-600 dark:text-emerald-400">
                v{product.version}
              </Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} showValue size="md" />
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                  Save ${(product.comparePrice - product.price).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                product.stock > 10
                  ? 'bg-emerald-500'
                  : product.stock > 0
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-medium">
              {product.stock > 10
                ? 'In Stock'
                : product.stock > 0
                  ? `Only ${product.stock} left in stock`
                  : 'Out of Stock'}
            </span>
          </div>

          <Separator />

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-lg border border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-none"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={product.stock === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <>
                  <Check className="size-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {/* Long Description Tabs */}
          {product.longDescription && (
            <Tabs defaultValue="details" className="mt-6">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <div className="rounded-lg border border-border/40 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.longDescription}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">
            Customer Reviews ({reviews.length})
          </h2>
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-emerald-600/30 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-600 dark:hover:text-white"
              >
                <Star className="size-4" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with {product.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="review-name">Your Name</Label>
                  <Input
                    id="review-name"
                    placeholder="John Doe"
                    value={reviewForm.userName}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, userName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <InteractiveStarRating
                    value={reviewForm.rating}
                    onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-title">Review Title</Label>
                  <Input
                    id="review-title"
                    placeholder="Great product!"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-comment">Your Review</Label>
                  <Textarea
                    id="review-comment"
                    placeholder="What did you like or dislike?"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSubmitReview}
                  disabled={submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-border/40 bg-muted/20 p-6 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
              <StarRating rating={averageRating} size="lg" />
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-sm text-muted-foreground">{star}</span>
                  <Star className="size-3 fill-emerald-500 text-emerald-500" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Reviews */}
        <div className="mt-8 space-y-4">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-border/60">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size="sm" className="mt-1" />
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="mt-3 font-medium">{review.title}</h4>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
