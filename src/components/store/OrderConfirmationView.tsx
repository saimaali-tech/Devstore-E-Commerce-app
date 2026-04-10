'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Copy,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store';
import type { Order } from '@/types';

async function fetchOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderNumber}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export function OrderConfirmationView() {
  const { lastOrderNumber, setCurrentView } = useStore();

  const {
    data: order,
    isLoading,
  } = useQuery({
    queryKey: ['order', lastOrderNumber],
    queryFn: () => fetchOrder(lastOrderNumber!),
    enabled: !!lastOrderNumber,
  });

  const handleCopyOrderNumber = () => {
    if (lastOrderNumber) {
      navigator.clipboard.writeText(lastOrderNumber).then(() => {
        toast.success('Order number copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy');
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
        >
          <CheckCircle2 className="size-10 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold sm:text-4xl">Order Confirmed!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {lastOrderNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-2"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <Package className="size-3.5" />
              Order #{lastOrderNumber}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleCopyOrderNumber}
            >
              <Copy className="size-3.5" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Order Details */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </motion.div>
      ) : order ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10"
        >
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Shipping Address
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {order.address}
                    {order.city && `, ${order.city}`}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Items
                </p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} &times; ${item.productPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(item.productPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">${order.total.toFixed(2)}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 dark:bg-emerald-900/20">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Order Status: {order.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setCurrentView('shop')}
        >
          Continue Shopping
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setCurrentView('home')}
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
