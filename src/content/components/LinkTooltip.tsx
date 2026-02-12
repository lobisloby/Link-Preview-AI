// src/content/components/LinkTooltip.tsx
import React, { useState, useEffect } from 'react';
import { LinkPreview, UserSettings } from '@shared/types';
import { LoadingSpinner } from './LoadingSpinner';
import { CategoryBadge } from './CategoryBadge';
import {
  getSentimentColor,
  getSentimentIcon,
  getReliabilityColor,
  extractDomain,
  truncateText,
} from '@shared/utils/helpers';

interface TooltipPosition {
  top: number;
  left: number;
  arrowLeft: number;
  placement: 'top' | 'bottom';
}

interface LinkTooltipProps {
  url: string;
  loading?: boolean;
  preview?: LinkPreview;
  error?: string;
  position: TooltipPosition;
  isExiting?: boolean;
  settings: UserSettings;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  onRetry?: () => void;
}

export const LinkTooltip: React.FC<LinkTooltipProps> = ({
  url,
  loading,
  preview,
  error,
  position,
  isExiting,
  settings,
  onMouseEnter,
  onMouseLeave,
  onClose,
  onRetry,
}) => {
  const domain = extractDomain(url);
  const [imgFailed, setImgFailed] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset image state when URL changes
  useEffect(() => {
    setImgFailed(null);
    setImgLoaded(false);
  }, [url]);

  const showImage = !!(preview?.image && imgFailed !== preview.image);

  const animationClass = isExiting
    ? `lp-exit lp-exit-${position.placement}`
    : `lp-enter lp-enter-${position.placement}`;

  return (
    <div
      className={`lp-tooltip ${animationClass}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: 360,
        maxHeight: 440,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
      aria-live="polite"
    >
      {/* ── Loading State ──────────────────────────────────────── */}
      {loading && !isExiting && (
        <>
          <div className="lp-header">
            <div className="lp-domain">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="lp-favicon"
              />
              <div className="lp-domain-info">
                <span className="lp-domain-name">{domain}</span>
                <span className="lp-domain-url">{truncateText(url, 45)}</span>
              </div>
            </div>
            <button onClick={onClose} className="lp-close" aria-label="Close preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="lp-content">
            <LoadingSpinner domain={domain} />
          </div>
        </>
      )}

      {/* ── Error State ────────────────────────────────────────── */}
      {error && !isExiting && (
        <>
          <div className="lp-header">
            <div className="lp-domain">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="lp-favicon"
              />
              <span className="lp-domain-name">{domain}</span>
            </div>
            <button onClick={onClose} className="lp-close" aria-label="Close preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="lp-error">
            <div className="lp-error-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="lp-error-title">Couldn't load preview</p>
            <p className="lp-error-desc">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="lp-retry-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                Try Again
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Preview Content ────────────────────────────────────── */}
      {preview && !isExiting && (
        <>
          {/* OG Image */}
          {showImage && (
            <div className={`lp-image-wrap ${imgLoaded ? 'lp-loaded' : ''}`}>
              <img
                src={preview.image}
                alt=""
                className="lp-image"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgFailed(preview.image!)}
              />
              <div className="lp-image-overlay" />
            </div>
          )}

          {/* Header */}
          <div className="lp-header">
            <div className="lp-domain">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="lp-favicon"
              />
              <div className="lp-domain-info">
                <span className="lp-domain-name">{domain}</span>
                {preview.siteName && preview.siteName !== domain && (
                  <span className="lp-site-name">{preview.siteName}</span>
                )}
              </div>
            </div>

            <div className="lp-header-actions">
              {preview.readingTime && (
                <span className="lp-reading-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {preview.readingTime} min
                </span>
              )}
              <button onClick={onClose} className="lp-close" aria-label="Close preview">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="lp-content lp-scrollable">
            {/* Title */}
            <h3 className="lp-title">
              {truncateText(preview.title, 100)}
            </h3>

            {/* Summary */}
            <p className="lp-summary">{preview.summary}</p>

            {/* Meta Badges */}
            <div className="lp-meta">
              {settings.showCategory && (
                <CategoryBadge category={preview.category} />
              )}

              {settings.showSentiment && (
                <span className={`lp-sentiment ${getSentimentColor(preview.sentiment)}`}>
                  <span className="lp-sentiment-emoji">
                    {getSentimentIcon(preview.sentiment)}
                  </span>
                  {preview.sentiment}
                </span>
              )}

              {settings.showReliability && (
                <span className={`lp-reliability ${getReliabilityColor(preview.reliability)}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {preview.reliability}%
                  <span className="lp-reliability-bar">
                    <span
                      className="lp-reliability-fill"
                      style={{ width: `${preview.reliability}%` }}
                    />
                  </span>
                </span>
              )}
            </div>

            {/* Key Points */}
            {settings.showKeyPoints && preview.keyPoints.length > 0 && (
              <div className="lp-keypoints">
                <h4>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Key Takeaways
                </h4>
                <ul>
                  {preview.keyPoints.slice(0, 4).map((point, index) => (
                    <li key={index} style={{ animationDelay: `${index * 0.08}s` }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="lp-footer">
            <span className="lp-branding">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Link Preview AI
            </span>
            <span className="lp-lang">
              {preview.language?.toUpperCase() || 'EN'}
            </span>
          </div>
        </>
      )}

      {/* Arrow - Dynamic Position */}
      <div
        className={`lp-arrow lp-arrow-${position.placement}`}
        style={{ left: position.arrowLeft }}
      />
    </div>
  );
};