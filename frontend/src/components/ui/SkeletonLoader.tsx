import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps {
  type?: 'card' | 'chart' | 'list';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', className }) => {
  return (
    <div className={cn("relative overflow-hidden bg-surface-container dark:bg-surface-container-low rounded-2xl", className)}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-bg animate-shimmer"></div>

      {type === 'card' && (
        <div className="p-6 space-y-4 opacity-0 pointer-events-none">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-40 bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
        </div>
      )}

      {type === 'chart' && (
        <div className="p-6 space-y-6 opacity-0 pointer-events-none">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="h-48 w-full bg-gray-300 rounded-lg"></div>
        </div>
      )}

      {type === 'list' && (
        <div className="p-6 space-y-4 opacity-0 pointer-events-none">
          <div className="h-6 w-full bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-300 rounded"></div>
        </div>
      )}
    </div>
  );
};
