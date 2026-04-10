'use client';

import { Package, Github, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store';

export function Footer() {
  const { setCurrentView } = useStore();

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
                <Package className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Dev<span className="text-emerald-600">Store</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Premium tech gear curated for developers. Quality tools that boost productivity and make coding a joy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Shop All
                </button>
              </li>
              <li>
                <span className="text-sm text-muted-foreground cursor-default">
                  Featured Products
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground cursor-default">About Us</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground cursor-default">Contact</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground cursor-default">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack Badge */}
          <div>
            <h3 className="text-sm font-semibold">Built With</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Next.js 16
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                TypeScript
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Tailwind CSS
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                shadcn/ui
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DevStore. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="size-3 fill-red-500 text-red-500" /> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}
