'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store';
import type { Cart } from '@/types';

async function fetchCart(cartId: string): Promise<Cart> {
  const res = await fetch(`/api/cart/${cartId}`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

interface OrderForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
}

function validateForm(form: OrderForm): string | null {
  if (!form.customerName.trim()) return 'Name is required';
  if (!form.customerEmail.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) return 'Invalid email format';
  if (!form.address.trim()) return 'Address is required';
  if (!form.city.trim()) return 'City is required';
  return null;
}

export function CheckoutView() {
  const { cartId, setCurrentView, setCartCount, setLastOrderNumber } = useStore();
  const [form, setForm] = useState<OrderForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: cart,
    isLoading: cartLoading,
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

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const formError = validateForm(form);
    if (formError) {
      toast.error(formError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || null,
          address: form.address,
          city: form.city,
          sessionId: cartId,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setLastOrderNumber(order.orderNumber);
        setCartCount(0);
        toast.success('Order placed successfully!');
        setCurrentView('order-confirmation');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="h-96 w-full rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button variant="outline" onClick={() => setCurrentView('shop')}>
          Go to Shop
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentView('cart')}
        >
          <ArrowLeft className="size-4" />
          Back to Cart
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your order
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Info */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="size-5 text-emerald-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={form.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={errors.customerName ? 'border-destructive' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-xs text-destructive">{errors.customerName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className={errors.customerEmail ? 'border-destructive' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-destructive">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="size-5 text-emerald-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Developer Lane"
                    value={form.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                {/* Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-muted-foreground text-[10px] font-medium text-background">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="line-clamp-1 text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
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
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">${total.toFixed(2)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By placing your order, you agree to our terms of service
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
