'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { HomeView } from '@/components/store/HomeView';
import { ShopView } from '@/components/store/ShopView';
import { ProductDetailView } from '@/components/store/ProductDetailView';
import { CartView } from '@/components/store/CartView';
import { CheckoutView } from '@/components/store/CheckoutView';
import { OrderConfirmationView } from '@/components/store/OrderConfirmationView';
import { WishlistView } from '@/components/store/WishlistView';
import { useStore } from '@/store';
import { apiUrl } from '@/lib/api-url';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

function AppContent() {
  const { currentView, cartId, setCartCount } = useStore();
  const mainRef = useRef<HTMLDivElement>(null);

  // Fetch cart count on mount and when cartId changes
  const fetchCartCount = useCallback(async () => {
    if (!cartId) return;
    try {
      const res = await fetch(apiUrl(`/api/cart/${cartId}`));
      if (res.ok) {
        const cart = await res.json();
        setCartCount(cart.items?.length || 0);
      }
    } catch {
      // Silently fail - cart might not exist yet
    }
  }, [cartId, setCartCount]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Scroll to top on view change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView key="home" />;
      case 'shop':
        return <ShopView key="shop" />;
      case 'product-detail':
        return <ProductDetailView key="product-detail" />;
      case 'cart':
        return <CartView key="cart" />;
      case 'checkout':
        return <CheckoutView key="checkout" />;
      case 'order-confirmation':
        return <OrderConfirmationView key="order-confirmation" />;
      case 'wishlist':
        return <WishlistView key="wishlist" />;
      default:
        return <HomeView key="home" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main ref={mainRef} className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-background text-foreground border-border shadow-lg',
            title: 'text-foreground font-semibold',
            description: 'text-muted-foreground',
          },
        }}
        richColors
      />
    </QueryClientProvider>
  );
}
