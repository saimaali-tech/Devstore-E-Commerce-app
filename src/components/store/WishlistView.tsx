'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { apiUrl } from '@/lib/api-url';
import type { Product } from '@/types';

type WishRow = {
  id: string;
  productId: number;
  product: Product;
};

export function WishlistView() {
  const { cartId, setCurrentView, setSelectedProductId } = useStore();
  const [items, setItems] = useState<WishRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cartId) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/wishlist/${cartId}`));
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (productId: number) => {
    if (!cartId) return;
    await fetch(apiUrl(`/api/wishlist/${cartId}/${productId}`), {
      method: 'DELETE',
    });
    void load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-rose-500/10">
          <Heart className="size-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Save gear for later (V2 feature).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No saved items yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((row) => (
            <motion.li
              key={row.id}
              layout
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(row.product.id);
                  setCurrentView('product-detail');
                }}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={row.product.image}
                  alt={row.product.name}
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <button
                  type="button"
                  className="text-left font-semibold leading-snug hover:text-emerald-600"
                  onClick={() => {
                    setSelectedProductId(row.product.id);
                    setCurrentView('product-detail');
                  }}
                >
                  {row.product.name}
                </button>
                <p className="text-sm text-muted-foreground">
                  ${row.product.price.toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-fit"
                  onClick={() => void remove(row.productId)}
                >
                  Remove
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
