'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  ShoppingCart,
  Menu,
  Home,
  Store,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/store';
import type { ViewType } from '@/types';
import { useAppRelease, releaseLevel } from '@/context/ReleaseContext';
import { apiUrl } from '@/lib/api-url';

export function Header() {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    cartCount,
    cartId,
  } = useStore();

  const release = useAppRelease();
  const showWishlist = releaseLevel(release) >= 2;
  const [wishlistCount, setWishlistCount] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    if (!showWishlist || !cartId) return;
    void fetch(apiUrl(`/api/wishlist/${cartId}`))
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setWishlistCount((d.items as unknown[])?.length ?? 0))
      .catch(() => {});
  }, [showWishlist, cartId, currentView]);

  const handleSearch = useCallback(() => {
    setSearchQuery(localSearch);
    setCurrentView('shop');
    setMobileMenuOpen(false);
  }, [localSearch, setSearchQuery, setCurrentView]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const navigate = useCallback(
    (view: ViewType) => {
      setCurrentView(view);
      setMobileMenuOpen(false);
    },
    [setCurrentView]
  );

  const navLinks = [
    { label: 'Home', view: 'home' as const, icon: Home },
    { label: 'Shop', view: 'shop' as const, icon: Store },
    ...(showWishlist
      ? [{ label: 'Wishlist', view: 'wishlist' as const, icon: Heart }]
      : []),
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600">
            <Package className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Dev<span className="text-emerald-600">Store</span>
          </span>
          <Badge variant="outline" className="ml-2 text-[10px] uppercase">
            {release}
          </Badge>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.view}
              variant={currentView === link.view ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate(link.view)}
              className="gap-2"
            >
              <link.icon className="size-4" />
              {link.label}
            </Button>
          ))}
        </nav>

        {/* Desktop Search + Cart */}
        <div className="hidden items-center gap-3 md:flex">
          {showWishlist && (
            <Button
              variant={currentView === 'wishlist' ? 'secondary' : 'ghost'}
              size="sm"
              className="relative gap-2"
              onClick={() => setCurrentView('wishlist')}
            >
              <Heart className="size-4 text-rose-500" />
              Wishlist
              {wishlistCount > 0 && (
                <Badge className="ml-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white border-0">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              )}
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 w-56 pl-9 lg:w-64"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setCurrentView('cart')}
          >
            <ShoppingCart className="size-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Badge className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] text-white border-0">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setCurrentView('cart')}
          >
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <Badge className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] text-white border-0">
                {cartCount > 99 ? '99+' : cartCount}
              </Badge>
            )}
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="flex items-center gap-2 px-2">
                <Package className="size-5 text-emerald-600" />
                <span className="text-lg font-bold">Dev<span className="text-emerald-600">Store</span></span>
              </SheetTitle>
              <div className="flex flex-col gap-4 px-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                  />
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.view}
                      variant={currentView === link.view ? 'secondary' : 'ghost'}
                      className="justify-start gap-2"
                      onClick={() => navigate(link.view)}
                    >
                      <link.icon className="size-4" />
                      {link.label}
                    </Button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
