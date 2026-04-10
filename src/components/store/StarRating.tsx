'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function StarRating({ rating, size = 'sm', showValue = false, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            'transition-colors',
            star <= Math.round(rating)
              ? 'fill-emerald-500 text-emerald-500'
              : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))}
      {showValue && (
        <span className={cn('ml-1 font-medium text-muted-foreground', textSizeMap[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
