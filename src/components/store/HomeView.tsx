'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Zap, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/store/ProductCard';
import { useStore } from '@/store';
import type { Product, Category } from '@/types';
import { apiUrl } from '@/lib/api-url';
import { useAppRelease, releaseLevel } from '@/context/ReleaseContext';

async function fetchFeaturedProducts(): Promise<Product[]> {
  const res = await fetch(apiUrl('/api/products?featured=true&limit=4'));
  if (!res.ok) throw new Error('Failed to fetch featured products');
  const data = await res.json();
  return data.products;
}

async function fetchNewArrivals(): Promise<Product[]> {
  const res = await fetch(apiUrl('/api/products?sort=newest&limit=4'));
  if (!res.ok) throw new Error('Failed to fetch new arrivals');
  const data = await res.json();
  return data.products;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(apiUrl('/api/categories'));
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeView() {
  const { setCurrentView, setSelectedCategory } = useStore();
  const release = useAppRelease();

  const {
    data: featuredProducts,
    isLoading: featuredLoading,
  } = useQuery({
    queryKey: ['products', 'featured', 'home'],
    queryFn: fetchFeaturedProducts,
  });

  const {
    data: newProducts,
    isLoading: newLoading,
  } = useQuery({
    queryKey: ['products', 'newest', 'home'],
    queryFn: fetchNewArrivals,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <div className="flex flex-col">
      {releaseLevel(release) >= 3 && (
        <div className="border-b border-border bg-emerald-500/5 px-4 py-2 text-center text-xs text-muted-foreground sm:text-sm">
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            V3 reliability track:
          </span>{' '}
          Orders are monitored end-to-end. See{' '}
          <code className="rounded bg-muted px-1">/api/ops/summary</code> on the API for a
          24-hour operations snapshot (Grafana-friendly JSON).
        </div>
      )}
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[480px] sm:min-h-[560px] lg:min-h-[600px]">
          <Image
            src="/images/hero/banner.png"
            alt="DevStore Hero Banner"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 mx-auto flex h-full min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
                <Sparkles className="size-4" />
                New Collection Available
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Dev<span className="text-emerald-400">Store</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 max-w-lg text-lg text-gray-300 sm:text-xl"
            >
              Premium Tech Gear for Developers
            </motion.p>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-2 max-w-md text-sm text-gray-400"
            >
              Curated keyboards, mice, monitors, and accessories designed for the modern developer workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 gap-2"
                onClick={() => setCurrentView('shop')}
              >
                Shop Now
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentView('shop');
                }}
              >
                Browse All Products
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'On orders over $100' },
            { icon: Shield, label: '2-Year Warranty', desc: 'On all products' },
            { icon: Zap, label: 'Fast Delivery', desc: '2-5 business days' },
            { icon: Sparkles, label: 'Premium Quality', desc: 'Developer approved' },
          ].map((feat) => (
            <div key={feat.label} className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10">
                <feat.icon className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">{feat.label}</p>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h2 className="text-2xl font-bold sm:text-3xl">Shop by Category</h2>
              <p className="mt-2 text-muted-foreground">
                Find exactly what you need
              </p>
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentView('shop');
                  }}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-emerald-600/30 hover:shadow-md hover:shadow-emerald-600/5"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-600/10 text-lg font-bold text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    {cat.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} products</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="bg-muted/20 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured Products</h2>
              <p className="mt-1 text-muted-foreground">
                Hand-picked favorites for the best developer experience
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden gap-2 text-emerald-600 sm:flex"
              onClick={() => setCurrentView('shop')}
            >
              View All <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          {featuredLoading ? (
            <ProductGridSkeleton />
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No featured products at the moment.
            </p>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="ghost"
              className="gap-2 text-emerald-600"
              onClick={() => setCurrentView('shop')}
            >
              View All Products <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">New Arrivals</h2>
              <p className="mt-1 text-muted-foreground">
                The latest additions to our catalog
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden gap-2 text-emerald-600 sm:flex"
              onClick={() => setCurrentView('shop')}
            >
              View All <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          {newLoading ? (
            <ProductGridSkeleton />
          ) : newProducts && newProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {newProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No new arrivals at the moment.
            </p>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="ghost"
              className="gap-2 text-emerald-600"
              onClick={() => setCurrentView('shop')}
            >
              View All Products <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to upgrade your setup?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-emerald-100">
              Join thousands of developers who trust DevStore for their workspace essentials.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-white text-emerald-700 hover:bg-emerald-50 gap-2"
              onClick={() => setCurrentView('shop')}
            >
              Shop Now <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
