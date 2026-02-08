// src/content/components/LinkTooltip.tsx
import React from 'react';
import { LinkPreview, UserSettings } from '@shared/types';
import { LoadingSpinner } from './LoadingSpinner';
import { CategoryBadge } from './CategoryBadge';
import { 
  getCategoryColor, 
  getSentimentColor, 
  getSentimentIcon,
  getReliabilityColor,
  extractDomain,
  truncateText 
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

  return (
    <div
      className="link-preview-tooltip"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: 350,
        maxHeight: 400,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="tooltip-header">
        <div className="tooltip-domain">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="tooltip-favicon"
          />
          <span>{domain}</span>
        </div>
        <button 
          onClick={onClose}
          className="tooltip-close"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="tooltip-content">
        {loading && (
          <div className="tooltip-loading">
            <LoadingSpinner />
            <p>Analyzing link...</p>
          </div>
        )}

        {error && (
          <div className="tooltip-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {preview && (
          <>
            {/* Title */}
            <h3 className="tooltip-title">
              {truncateText(preview.title, 80)}
            </h3>

            {/* Summary */}
            <p className="tooltip-summary">
              {preview.summary}
            </p>

            {/* Meta Info */}
            <div className="tooltip-meta">
              {settings.showCategory && (
                <CategoryBadge category={preview.category} />
              )}

              {settings.showSentiment && (
                <span className={`tooltip-sentiment ${getSentimentColor(preview.sentiment)}`}>
                  {getSentimentIcon(preview.sentiment)} {preview.sentiment}
                </span>
              )}

              {settings.showReliability && (
                <span className={`tooltip-reliability ${getReliabilityColor(preview.reliability)}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {preview.reliability}%
                </span>
              )}
            </div>

            {/* Key Points */}
            {settings.showKeyPoints && preview.keyPoints.length > 0 && (
              <div className="tooltip-keypoints">
                <h4>Key Points:</h4>
                <ul>
                  {preview.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
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
      </div>

      {/* Arrow */}
      <div 
        className={`tooltip-arrow tooltip-arrow-${position.position}`}
      />
    </div>
  );
};