// src/content/components/LoadingSpinner.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="tooltip-skeleton">
    {/* Image skeleton */}
    <div className="skeleton-image shimmer" />

    {/* Content skeleton */}
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-title shimmer" />
      <div className="skeleton-line skeleton-text shimmer" />
      <div className="skeleton-line skeleton-text-short shimmer" />

      {/* Meta skeleton */}
      <div className="skeleton-meta">
        <div className="skeleton-badge shimmer" />
        <div className="skeleton-badge shimmer" />
        <div className="skeleton-badge shimmer" />
      </div>
    </div>

    {/* Status indicator */}
    <div className="skeleton-status">
      <div className="analyzing-pulse" />
      <span>
        AI is analyzing this link
        <span className="analyzing-dots" />
      </span>
    </div>
  </div>
);