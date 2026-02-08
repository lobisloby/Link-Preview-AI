// src/content/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { LinkPreview, PreviewResponse, UserSettings } from '@shared/types';

interface TooltipState {
  visible: boolean;
  loading: boolean;
  position: { x: number; y: number };
  preview: LinkPreview | null;
  error: string | null;
  limitReached: boolean;
  remainingPreviews: number;
}

const initialState: TooltipState = {
  visible: false,
  loading: false,
  position: { x: 0, y: 0 },
  preview: null,
  error: null,
  limitReached: false,
  remainingPreviews: -1,
};

export default function App() {
  const [state, setState] = useState<TooltipState>(initialState);
  const [enabled, setEnabled] = useState(true);
  const [hoverDelay, setHoverDelay] = useState(500);
  const [limitReachedGlobal, setLimitReachedGlobal] = useState(false);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [toastShownThisSession, setToastShownThisSession] = useState(false);

  // Load settings and check limit on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [settings, limitCheck] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }),
          chrome.runtime.sendMessage({ type: 'CHECK_LIMIT' }),
        ]);

        if (settings) {
          setEnabled(settings.enabled);
          setHoverDelay(settings.hoverDelay);
        }

        if (limitCheck && !limitCheck.canUse) {
          setLimitReachedGlobal(true);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();

    // Listen for messages
    const handleMessage = (message: { type: string; payload?: unknown }) => {
      if (message.type === 'SETTINGS_UPDATED' && message.payload) {
        const settings = message.payload as UserSettings;
        setEnabled(settings.enabled);
        setHoverDelay(settings.hoverDelay);
      }
      
      if (message.type === 'LIMIT_RESET') {
        setLimitReachedGlobal(false);
        setToastShownThisSession(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.settings?.newValue) {
        setEnabled(changes.settings.newValue.enabled);
        setHoverDelay(changes.settings.newValue.hoverDelay);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Handle link hover
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      // Don't show if disabled or limit reached
      if (!enabled || limitReachedGlobal) {
        return;
      }

      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement | null;
      
      if (!link?.href || !link.href.startsWith('http')) return;
      
      // Skip if same domain (internal links)
      try {
        const linkDomain = new URL(link.href).hostname;
        const currentDomain = window.location.hostname;
        if (linkDomain === currentDomain) return;
      } catch {
        return;
      }

      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        showPreview(link.href, e.clientX, e.clientY);
      }, hoverDelay);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && timeout) {
        clearTimeout(timeout);
      }
      
      // Delay hiding to allow moving to tooltip
      setTimeout(() => {
        const tooltip = document.querySelector('[data-link-preview-tooltip]');
        if (tooltip && !tooltip.matches(':hover')) {
          hide();
        }
      }, 150);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (timeout) clearTimeout(timeout);
    };
  }, [enabled, hoverDelay, limitReachedGlobal]);

  const showPreview = useCallback(async (url: string, x: number, y: number) => {
    const tooltipWidth = 320;
    const tooltipHeight = 300;
    const padding = 15;

    // Calculate position
    let posX = x + padding;
    let posY = y + padding;

    // Keep within viewport
    if (posX + tooltipWidth > window.innerWidth - padding) {
      posX = x - tooltipWidth - padding;
    }
    if (posY + tooltipHeight > window.innerHeight - padding) {
      posY = window.innerHeight - tooltipHeight - padding;
    }
    
    // Ensure not off-screen
    posX = Math.max(padding, posX);
    posY = Math.max(padding, posY);

    setState({
      ...initialState,
      visible: true,
      loading: true,
      position: { x: posX, y: posY },
    });

    try {
      const response: PreviewResponse = await chrome.runtime.sendMessage({
        type: 'GET_PREVIEW',
        payload: url,
      });

      // Handle limit reached
      if (response.limitReached) {
        setLimitReachedGlobal(true);
        
        setState((s) => ({
          ...s,
          loading: false,
          limitReached: true,
        }));

        // Show toast once per session
        if (!toastShownThisSession) {
          setShowLimitToast(true);
          setToastShownThisSession(true);
        }
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
          hide();
        }, 4000);
        
        return;
      }

      // Handle success
      if (response.success && response.data) {
        setState((s) => ({
          ...s,
          loading: false,
          preview: response.data!,
          remainingPreviews: response.remainingPreviews ?? -1,
        }));
      } else {
        // Handle error
        setState((s) => ({
          ...s,
          loading: false,
          error: response.error || 'Failed to load preview',
        }));
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Failed to load preview',
      }));
    }
  }, [toastShownThisSession]);

  const hide = useCallback(() => {
    setState(initialState);
  }, []);

  const hideToast = useCallback(() => {
    setShowLimitToast(false);
  }, []);

  // Auto-hide toast after 6 seconds
  useEffect(() => {
    if (showLimitToast) {
      const timer = setTimeout(() => {
        setShowLimitToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showLimitToast]);

  // Get domain from URL
  const domain = state.preview?.url
    ? (() => {
        try {
          return new URL(state.preview.url).hostname.replace('www.', '');
        } catch {
          return '';
        }
      })()
    : '';

  return (
    <>
      {/* Main Tooltip */}
      {state.visible && (
        <div
          data-link-preview-tooltip
          style={{
            position: 'fixed',
            top: state.position.y,
            left: state.position.x,
            zIndex: 2147483647,
            pointerEvents: 'auto',
          }}
          onMouseLeave={hide}
        >
          <div style={tooltipStyles.container}>
            {/* Header */}
            <div style={tooltipStyles.header}>
              <div style={tooltipStyles.domain}>
                {domain && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                    alt=""
                    style={tooltipStyles.favicon}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span>{domain || 'Loading...'}</span>
              </div>
              <button 
                style={tooltipStyles.closeBtn} 
                onClick={hide}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#334155';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={tooltipStyles.content}>
              {/* Loading */}
              {state.loading && (
                <div style={tooltipStyles.centerContent}>
                  <div style={tooltipStyles.spinner} />
                  <span style={tooltipStyles.loadingText}>Analyzing link...</span>
                </div>
              )}

              {/* Limit Reached */}
              {state.limitReached && !state.loading && (
                <div style={tooltipStyles.centerContent}>
                  <span style={tooltipStyles.limitIcon}>⏰</span>
                  <h3 style={tooltipStyles.limitTitle}>Daily Limit Reached</h3>
                  <p style={tooltipStyles.limitDesc}>
                    You've used all your free previews for today.
                  </p>
                  <p style={tooltipStyles.limitReset}>Resets at midnight</p>
                  <button 
                    style={tooltipStyles.upgradeBtn}
                    onClick={() => {
                      chrome.runtime.sendMessage({ type: 'OPEN_UPGRADE' });
                      hide();
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLButtonElement).style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                    }}
                  >
                    ⭐ Upgrade for Unlimited
                  </button>
                </div>
              )}

              {/* Error */}
              {state.error && !state.limitReached && !state.loading && (
                <div style={tooltipStyles.centerContent}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <p style={tooltipStyles.errorText}>{state.error}</p>
                </div>
              )}

              {/* Preview Content */}
              {state.preview && !state.loading && !state.limitReached && (
                <>
                  <h3 style={tooltipStyles.title}>{state.preview.title}</h3>
                  <p style={tooltipStyles.summary}>{state.preview.summary}</p>

                  <div style={tooltipStyles.meta}>
                    <span style={tooltipStyles.categoryBadge}>
                      {state.preview.category}
                    </span>
                    <span style={tooltipStyles.sentimentBadge}>
                      {state.preview.sentiment === 'positive' && '😊 '}
                      {state.preview.sentiment === 'neutral' && '😐 '}
                      {state.preview.sentiment === 'negative' && '😟 '}
                      {state.preview.sentiment === 'mixed' && '🤔 '}
                      {state.preview.sentiment}
                    </span>
                    <span style={tooltipStyles.reliabilityBadge}>
                      🛡️ {state.preview.reliability}%
                    </span>
                  </div>

                  {state.preview.keyPoints && state.preview.keyPoints.length > 0 && (
                    <div style={tooltipStyles.keyPoints}>
                      <h4 style={tooltipStyles.keyPointsTitle}>Key Points</h4>
                      <ul style={tooltipStyles.keyPointsList}>
                        {state.preview.keyPoints.slice(0, 3).map((point, i) => (
                          <li key={i} style={tooltipStyles.keyPointItem}>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={tooltipStyles.footer}>
              <span style={tooltipStyles.branding}>🔗 Link Preview AI</span>
              {state.remainingPreviews > 0 && state.remainingPreviews <= 10 && (
                <span style={tooltipStyles.remainingBadge}>
                  {state.remainingPreviews} left
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Limit Toast Notification */}
      {showLimitToast && (
        <div style={toastStyles.container}>
          <div style={toastStyles.content}>
            <span style={toastStyles.icon}>⏰</span>
            <div style={toastStyles.textContainer}>
              <strong style={toastStyles.title}>Daily limit reached</strong>
              <span style={toastStyles.subtitle}>
                Previews will resume at midnight
              </span>
            </div>
            <button 
              style={toastStyles.closeBtn} 
              onClick={hideToast}
            >
              ✕
            </button>
          </div>
          <div style={toastStyles.progressTrack}>
            <div style={toastStyles.progressBar} />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ==================== STYLES ====================

const tooltipStyles: Record<string, React.CSSProperties> = {
  container: {
    width: '320px',
    background: '#1e293b',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
    overflow: 'hidden',
    border: '1px solid #334155',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    animation: 'fadeIn 0.2s ease-out',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    borderBottom: '1px solid #334155',
  },

  domain: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#94a3b8',
  },

  favicon: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
  },

  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '14px',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'all 0.15s',
    lineHeight: 1,
  },

  content: {
    padding: '16px',
    minHeight: '120px',
  },

  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px 10px',
    gap: '10px',
  },

  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #334155',
    borderTopColor: '#0ea5e9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  loadingText: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
  },

  limitIcon: {
    fontSize: '36px',
    marginBottom: '4px',
  },

  limitTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#f1f5f9',
    margin: 0,
  },

  limitDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.4,
  },

  limitReset: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },

  upgradeBtn: {
    marginTop: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
  },

  errorText: {
    fontSize: '13px',
    color: '#f87171',
    margin: 0,
    marginTop: '8px',
  },

  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f1f5f9',
    margin: '0 0 8px 0',
    lineHeight: 1.35,
  },

  summary: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 14px 0',
    lineHeight: 1.55,
  },

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },

  categoryBadge: {
    padding: '4px 10px',
    background: 'rgba(14, 165, 233, 0.15)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '6px',
    textTransform: 'capitalize',
  },

  sentimentBadge: {
    padding: '4px 10px',
    background: 'rgba(148, 163, 184, 0.15)',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '6px',
    textTransform: 'capitalize',
  },

  reliabilityBadge: {
    padding: '4px 10px',
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '6px',
  },

  keyPoints: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid #334155',
  },

  keyPointsTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
  },

  keyPointsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },

  keyPointItem: {
    fontSize: '12px',
    color: '#94a3b8',
    paddingLeft: '14px',
    position: 'relative',
    marginBottom: '6px',
    lineHeight: 1.4,
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#0f172a',
    borderTop: '1px solid #334155',
  },

  branding: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },

  remainingBadge: {
    padding: '3px 8px',
    background: 'rgba(251, 191, 36, 0.15)',
    color: '#fbbf24',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
  },
};

const toastStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '340px',
    background: '#1e293b',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    border: '1px solid #334155',
    overflow: 'hidden',
    zIndex: 2147483647,
    animation: 'slideIn 0.3s ease-out',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    pointerEvents: 'auto',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
  },

  icon: {
    fontSize: '28px',
    flexShrink: 0,
  },

  textContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },

  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f1f5f9',
  },

  subtitle: {
    fontSize: '12px',
    color: '#94a3b8',
  },

  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '18px',
    padding: '6px',
    flexShrink: 0,
    lineHeight: 1,
  },

  progressTrack: {
    height: '3px',
    background: '#334155',
  },

  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6)',
    animation: 'shrink 6s linear forwards',
  },
};