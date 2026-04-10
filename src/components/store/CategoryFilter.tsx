'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const allCategories = [{ name: 'All', count: 0 }, ...categories];

  return (
    <div className="relative flex items-center gap-2">
      {/* Left scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 size-8 rounded-full"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-1"
      >
        {allCategories.map((cat) => {
          const isActive = cat.name === 'All' ? selected === '' : selected === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name === 'All' ? '' : cat.name)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {cat.name}
              {cat.count > 0 && (
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-emerald-100' : 'text-muted-foreground'
                  )}
                >
                  ({cat.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 size-8 rounded-full"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
