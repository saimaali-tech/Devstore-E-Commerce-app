'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store';
import type { Cart } from '@/types';
import { apiUrl } from '@/lib/api-url';

async function fetchCart(cartId: string): Promise<Cart> {
  const res = await fetch(apiUrl(`/api/cart/${cartId}`));
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

function CartSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl border p-4">
          <Skeleton className="size-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function CartView() {
  const { cartId, setCartCount, setCurrentView } = useStore();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => fetchCart(cartId),
    enabled: !!cartId,
  });

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch(apiUrl(`/api/cart/${cartId}/items/${itemId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCartCount(updatedCart.items?.length || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        toast.error('Failed to update quantity');
      }
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: number, itemName: string) => {
    try {
      const res = await fetch(apiUrl(`/api/cart/${cartId}/items/${itemId}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCartCount(updatedCart.items?.length || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success(`${itemName} removed from cart`);
      } else {
        toast.error('Failed to remove item');
      }
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CartSkeleton />
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-6 py-20"
      >
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet
          </p>
        </div>
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setCurrentView('shop')}
        >
          <ShoppingCart className="size-4" />
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold sm:text-3xl">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="overflow-hidden border-border/60">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <button
                        className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24"
                        onClick={() => {
                          setCurrentView('product-detail');
                        }}
                      >
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{item.productName}</h3>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            ${item.productPrice.toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center rounded-lg border border-border/60">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>

                          {/* Subtotal + Remove */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              ${(item.productPrice * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.id, item.productName)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setCurrentView('shop')}
            >
              <ArrowLeft className="size-4" />
              Continue Shopping
            </Button>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-border/60 sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-emerald-600">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                onClick={() => setCurrentView('checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
