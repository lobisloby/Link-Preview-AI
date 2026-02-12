// src/content/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  domain?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ domain }) => (
  <div className="lp-skeleton">
    {/* Image skeleton */}
    <div className="lp-skeleton-image lp-shimmer" />

    {/* Content skeleton */}
    <div className="lp-skeleton-body">
      <div className="lp-skeleton-line lp-skeleton-title lp-shimmer" />
      <div className="lp-skeleton-line lp-skeleton-text lp-shimmer" />
      <div className="lp-skeleton-line lp-skeleton-text-short lp-shimmer" />

      {/* Meta skeleton */}
      <div className="lp-skeleton-meta">
        <div className="lp-skeleton-badge lp-shimmer" />
        <div className="lp-skeleton-badge lp-shimmer" />
        <div className="lp-skeleton-badge lp-shimmer" />
      </div>
    </div>

    {/* Status indicator */}
    <div className="lp-skeleton-status">
      <div className="lp-analyzing-pulse" />
      <span>
        Analyzing{domain ? ` ${domain}` : ''}
        <span className="lp-analyzing-dots" />
      </span>
    </div>
  </div>
);