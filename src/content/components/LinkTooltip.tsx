// src/content/components/LinkTooltip.tsx
import React, { useState } from 'react';
import { LinkPreview, UserSettings } from '@shared/types';
import { LoadingSpinner } from './LoadingSpinner';
import { CategoryBadge } from './CategoryBadge';
import {
  getCategoryColor,
  getSentimentColor,
  getSentimentIcon,
  getReliabilityColor,
  extractDomain,
  truncateText,
} from '@shared/utils/helpers';

interface LinkTooltipProps {
  url: string;
  loading?: boolean;
  preview?: LinkPreview;
  error?: string;
  position: { top: number; left: number; position: 'top' | 'bottom' };
  settings: UserSettings;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

export const LinkTooltip: React.FC<LinkTooltipProps> = ({
  url,
  loading,
  preview,
  error,
  position,
  settings,
  onMouseEnter,
  onMouseLeave,
  onClose,
}) => {
  const domain = extractDomain(url);
  const [imgFailed, setImgFailed] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const showImage = !!(preview?.image && imgFailed !== preview.image);

  return (
    <div
      className={`link-preview-tooltip lp-enter lp-arrow-${position.position}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: 360,
        maxHeight: 440,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Loading State ──────────────────────────────────────── */}
      {loading && (
        <div className="tooltip-content">
          <LoadingSpinner />
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────── */}
      {error && (
        <>
          <div className="tooltip-header">
            <div className="tooltip-domain">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="tooltip-favicon"
              />
              <span>{domain}</span>
            </div>
            <button onClick={onClose} className="tooltip-close" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="tooltip-error">
            <div className="tooltip-error-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="tooltip-error-title">Couldn't load preview</p>
            <p className="tooltip-error-desc">{error}</p>
          </div>
        </>
      )}

      {/* ── Preview Content ────────────────────────────────────── */}
      {preview && (
        <>
          {/* OG Image */}
          {showImage && (
            <div className={`tooltip-image-wrap ${imgLoaded ? 'loaded' : ''}`}>
              <img
                src={preview.image}
                alt=""
                className="tooltip-image"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgFailed(preview.image!)}
              />
              <div className="tooltip-image-overlay" />
            </div>
          )}

          {/* Header */}
          <div className="tooltip-header">
            <div className="tooltip-domain">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="tooltip-favicon"
              />
              <div className="tooltip-domain-info">
                <span className="tooltip-domain-name">{domain}</span>
                {preview.siteName && (
                  <span className="tooltip-site-name">{preview.siteName}</span>
                )}
              </div>
            </div>

            <div className="tooltip-header-right">
              {preview.readingTime && (
                <span className="tooltip-reading-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {preview.readingTime} min
                </span>
              )}
              <button onClick={onClose} className="tooltip-close" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="tooltip-content">
            {/* Title */}
            <h3 className="tooltip-title">
              {truncateText(preview.title, 100)}
            </h3>

            {/* Summary */}
            <p className="tooltip-summary">{preview.summary}</p>

            {/* Meta Badges */}
            <div className="tooltip-meta">
              {settings.showCategory && (
                <CategoryBadge category={preview.category} />
              )}

              {settings.showSentiment && (
                <span className={`tooltip-sentiment ${getSentimentColor(preview.sentiment)}`}>
                  <span className="sentiment-emoji">
                    {getSentimentIcon(preview.sentiment)}
                  </span>
                  {preview.sentiment}
                </span>
              )}

              {settings.showReliability && (
                <span className={`tooltip-reliability ${getReliabilityColor(preview.reliability)}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {preview.reliability}%

                  {/* Mini progress bar */}
                  <span className="reliability-bar">
                    <span
                      className="reliability-fill"
                      style={{ width: `${preview.reliability}%` }}
                    />
                  </span>
                </span>
              )}
            </div>

            {/* Key Points */}
            {settings.showKeyPoints && preview.keyPoints.length > 0 && (
              <div className="tooltip-keypoints">
                <h4>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Key Takeaways
                </h4>
                <ul>
                  {preview.keyPoints.map((point, index) => (
                    <li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="tooltip-footer">
            <span className="tooltip-branding">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Link Preview AI
            </span>
            <span className="tooltip-lang">
              {preview.language?.toUpperCase() || 'EN'}
            </span>
          </div>
        </>
      )}

      {/* Arrow */}
      <div className={`tooltip-arrow tooltip-arrow-${position.position}`} />
    </div>
  );
};