'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/store/StarRating';
import { useStore } from '@/store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { setCurrentView, setSelectedProductId, cartId, setCartCount } = useStore();
  const queryClient = useQueryClient();
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addingToCart || product.stock === 0) return;
    setAddingToCart(true);

    try {
      const res = await fetch(`/api/cart/${cartId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        const cart = await res.json();
        setCartCount(cart.items?.length || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success(`${product.name} added to cart`, {
          description: `$${product.price.toFixed(2)}`,
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

  const handleViewDetails = () => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  const stockLabel =
    product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock';
  const stockColor =
    product.stock > 10
      ? 'text-emerald-600'
      : product.stock > 0
        ? 'text-amber-600'
        : 'text-destructive';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="group overflow-hidden border-border/60 transition-shadow hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
        onClick={handleViewDetails}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Button
                size="sm"
                variant="secondary"
                className="shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                <Eye className="size-4" />
                View
              </Button>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.featured && (
              <Badge className="bg-emerald-600 text-white border-0 text-[10px]">
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-500 text-white border-0 text-[10px]">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="mb-2 line-clamp-1 text-sm font-semibold leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={product.rating} showValue />
          </div>

          {/* Price */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock + Add to Cart */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${stockColor}`}>
              {stockLabel}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs border-emerald-600/30 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-600 dark:hover:text-white"
              disabled={product.stock === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <Check className="size-3.5" />
              ) : (
                <ShoppingCart className="size-3.5" />
              )}
              {addingToCart ? 'Added' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
