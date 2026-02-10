// src/popup/components/Subscription.tsx
import React, { useState } from 'react';
import { UserSubscription } from '@shared/types';
import { theme } from '@shared/theme';
import { LEMON_SQUEEZY_CONFIG } from '@shared/constants';
import {
  Crown,
  Check,
  Zap,
  Star,
  KeyRound,
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface SubscriptionProps {
  subscription: UserSubscription | null;
  onRefresh: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────
const maskKey = (key: string): string => {
  if (!key) return '';
  if (key.length <= 10) return '••••••••';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
};

const formatDate = (ts: number | null): string => {
  if (!ts) return 'Lifetime';
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ── Component ──────────────────────────────────────────────────────
export const Subscription: React.FC<SubscriptionProps> = ({
  subscription,
  onRefresh,
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasActiveLicense = !!(
    subscription &&
    subscription.tier !== 'free' &&
    subscription.licenseKey
  );

  // ── Activate ────────────────────────────────────────────────────
  const handleActivate = async () => {
    const trimmed = licenseKey.trim();
    if (!trimmed) {
      setError('Please enter a license key');
      return;
    }

    setActivating(true);
    setError('');
    setSuccess('');

    try {
      const result = await chrome.runtime.sendMessage({
        type: 'ACTIVATE_LICENSE',
        payload: trimmed,
      });

      if (result?.success) {
        setSuccess('License activated successfully!');
        setLicenseKey('');
        onRefresh();
      } else {
        setError(result?.error || 'Activation failed. Please check your key.');
      }
    } catch {
      setError('Could not reach background service. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  // ── Deactivate ──────────────────────────────────────────────────
  const handleDeactivate = async () => {
    setDeactivating(true);
    setError('');
    setSuccess('');

    try {
      await chrome.runtime.sendMessage({ type: 'DEACTIVATE_LICENSE' });
      onRefresh();
    } catch {
      setError('Deactivation failed. Please try again.');
    } finally {
      setDeactivating(false);
    }
  };

  // ── Copy key ────────────────────────────────────────────────────
  const handleCopyKey = () => {
    if (subscription?.licenseKey) {
      navigator.clipboard.writeText(subscription.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

    // ── Open checkout ───────────────────────────────────────────────
  const handleUpgrade = () => {
    window.open(LEMON_SQUEEZY_CONFIG.proCheckoutUrl, '_blank');
  };

  // ── Plan data ───────────────────────────────────────────────────
  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['25 previews/day', 'Basic summaries', 'Category detection'],
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '$5',
      period: '/month',
      features: [
        '500 previews/day',
        'Advanced AI analysis',
        'Sentiment detection',
        'Key points extraction',
        'Priority support',
      ],
      popular: true,
    },
  ];

  return (
    <div style={styles.container}>
      {/* ── Current Plan Banner ─────────────────────────────────── */}
      <div style={styles.currentPlan}>
        <div style={styles.currentPlanGlow} />
        <div style={styles.currentPlanContent}>
          <div style={styles.currentPlanLeft}>
            <span style={styles.currentPlanLabel}>Current Plan</span>
            <span style={styles.currentPlanName}>
              {subscription?.tier === 'pro' && (
                <Crown size={18} color="#fbbf24" />
              )}
              {subscription?.tier === 'team' && (
                <Crown size={18} color="#a78bfa" />
              )}
              {(subscription?.tier || 'free').toUpperCase()}
            </span>
          </div>

          {hasActiveLicense && subscription!.expiresAt && (
            <div style={styles.currentPlanRight}>
              <span style={styles.renewsLabel}>Renews</span>
              <span style={styles.renewsDate}>
                {formatDate(subscription!.expiresAt)}
              </span>
            </div>
          )}

          {hasActiveLicense && !subscription!.expiresAt && (
            <div style={styles.currentPlanRight}>
              <span style={styles.renewsDate}>Lifetime</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan Cards ──────────────────────────────────────────── */}
      <div style={styles.plansList}>
        {plans.map((plan) => {
          const isCurrent = subscription?.tier === plan.id;

          return (
            <div
              key={plan.id}
              style={{
                ...styles.planCard,
                border: isCurrent
                  ? `2px solid ${theme.accent.primary}`
                  : `1px solid ${theme.border.default}`,
                background: isCurrent
                  ? `${theme.accent.primary}08`
                  : theme.bg.secondary,
              }}
            >
              {plan.popular && !isCurrent && (
                <span style={styles.popularBadge}>
                  <Star size={10} fill="currentColor" />
                  POPULAR
                </span>
              )}

              <div style={styles.planHeader}>
                <div>
                  <h3 style={styles.planName}>{plan.name}</h3>
                  <div style={styles.planPrice}>
                    <span style={styles.priceAmount}>{plan.price}</span>
                    <span style={styles.pricePeriod}>{plan.period}</span>
                  </div>
                </div>

                {isCurrent ? (
                  <span style={styles.currentBadge}>
                    <Check size={12} />
                    Current
                  </span>
                ) : (
                  plan.id !== 'free' && (
                    <button onClick={handleUpgrade} style={styles.upgradeBtn}>
                      <Zap size={14} />
                      Upgrade
                    </button>
                  )
                )}
              </div>

              <ul style={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={styles.featureItem}>
                    <Check size={14} color={theme.accent.success} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── License Section ─────────────────────────────────────── */}
      <div style={styles.licenseSection}>
        {hasActiveLicense ? (
          /* ── Active license view ──────────────────────────────── */
          <>
            <div style={styles.licenseActiveHeader}>
              <ShieldCheck size={20} color={theme.accent.success} />
              <h3 style={styles.licenseTitleActive}>License Active</h3>
            </div>

            {/* Key display */}
            <div style={styles.licenseInfoCard}>
              <div style={styles.licenseInfoRow}>
                <span style={styles.licenseInfoLabel}>License Key</span>
                <div style={styles.licenseKeyRow}>
                  <code style={styles.licenseKeyCode}>
                    {maskKey(subscription!.licenseKey!)}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    style={styles.copyBtn}
                    title="Copy full key"
                  >
                    {copied ? (
                      <Check size={14} color={theme.accent.success} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div style={styles.licenseInfoDivider} />

              <div style={styles.licenseInfoRow}>
                <span style={styles.licenseInfoLabel}>Plan</span>
                <span style={styles.licenseInfoValue}>
                  {subscription!.tier.charAt(0).toUpperCase() +
                    subscription!.tier.slice(1)}
                </span>
              </div>

              <div style={styles.licenseInfoDivider} />

              <div style={styles.licenseInfoRow}>
                <span style={styles.licenseInfoLabel}>Status</span>
                <span style={styles.statusBadge}>
                  <span style={styles.statusDot} />
                  Active
                </span>
              </div>

              {subscription!.expiresAt && (
                <>
                  <div style={styles.licenseInfoDivider} />
                  <div style={styles.licenseInfoRow}>
                    <span style={styles.licenseInfoLabel}>Expires</span>
                    <span style={styles.licenseInfoValue}>
                      {formatDate(subscription!.expiresAt)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Deactivate button */}
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              style={{
                ...styles.deactivateBtn,
                opacity: deactivating ? 0.6 : 1,
                cursor: deactivating ? 'not-allowed' : 'pointer',
              }}
            >
              {deactivating ? (
                <Loader2 size={14} style={styles.spinIcon} />
              ) : (
                <ShieldOff size={14} />
              )}
              {deactivating ? 'Deactivating…' : 'Deactivate License'}
            </button>
          </>
        ) : (
          /* ── License input view ──────────────────────────────── */
          <>
            <div style={styles.licenseInputHeader}>
              <KeyRound size={18} color={theme.accent.primary} />
              <h3 style={styles.licenseTitle}>Have a license key?</h3>
            </div>

            <div style={styles.licenseRow}>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && !activating && handleActivate()}
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                disabled={activating}
                style={{
                  ...styles.licenseInput,
                  borderColor: error
                    ? theme.accent.error
                    : theme.border.default,
                }}
              />
              <button
                onClick={handleActivate}
                disabled={activating || !licenseKey.trim()}
                style={{
                  ...styles.activateBtn,
                  opacity: activating || !licenseKey.trim() ? 0.6 : 1,
                  cursor:
                    activating || !licenseKey.trim()
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {activating ? (
                  <Loader2 size={14} style={styles.spinIcon} />
                ) : null}
                {activating ? 'Verifying…' : 'Activate'}
              </button>
            </div>

            {/* Checkout link */}
            <button onClick={handleUpgrade} style={styles.getKeyLink}>
              Don't have a key? Get one here{' '}
              <ExternalLink size={12} />
            </button>
          </>
        )}

        {/* ── Feedback messages ────────────────────────────────── */}
        {error && (
          <div style={styles.feedbackError}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.feedbackSuccess}>
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  /* ── Current Plan Banner ──────────────────────────────────────── */
  currentPlan: {
    background: theme.gradient.accent,
    borderRadius: '16px',
    padding: '18px',
    position: 'relative',
    overflow: 'hidden',
  },
  currentPlanGlow: {
    position: 'absolute',
    top: '-30px',
    right: '-30px',
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '50%',
    filter: 'blur(30px)',
  },
  currentPlanContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  currentPlanLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  currentPlanLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
  currentPlanName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '22px',
    fontWeight: 700,
    color: 'white',
  },
  currentPlanRight: {
    textAlign: 'right' as const,
  },
  renewsLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2px',
  },
  renewsDate: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
  },

  /* ── Plans ────────────────────────────────────────────────────── */
  plansList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  planCard: {
    borderRadius: '16px',
    padding: '18px',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: '-8px',
    left: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: theme.accent.secondary,
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '10px',
  },
  planHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  planName: {
    fontSize: '16px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: 0,
  },
  planPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginTop: '4px',
  },
  priceAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: theme.text.primary,
  },
  pricePeriod: {
    fontSize: '13px',
    color: theme.text.muted,
  },
  currentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: theme.accent.primary,
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '20px',
  },
  upgradeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: theme.gradient.primary,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: theme.text.secondary,
  },

  /* ── License Section ──────────────────────────────────────────── */
  licenseSection: {
    background: theme.bg.secondary,
    borderRadius: '14px',
    padding: '16px',
    border: `1px solid ${theme.border.default}`,
  },

  /* Active header */
  licenseActiveHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  licenseTitleActive: {
    fontSize: '15px',
    fontWeight: 600,
    color: theme.accent.success,
    margin: 0,
  },

  /* Info card (active state) */
  licenseInfoCard: {
    background: theme.bg.primary,
    borderRadius: '10px',
    padding: '14px',
    border: `1px solid ${theme.border.default}`,
    marginBottom: '12px',
  },
  licenseInfoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  licenseInfoLabel: {
    fontSize: '12px',
    color: theme.text.muted,
    fontWeight: 500,
  },
  licenseInfoValue: {
    fontSize: '13px',
    color: theme.text.primary,
    fontWeight: 600,
  },
  licenseInfoDivider: {
    height: '1px',
    background: theme.border.default,
    margin: '10px 0',
  },
  licenseKeyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  licenseKeyCode: {
    fontSize: '12px',
    color: theme.text.secondary,
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: `1px solid ${theme.border.default}`,
    borderRadius: '6px',
    cursor: 'pointer',
    color: theme.text.muted,
    padding: 0,
    flexShrink: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: theme.accent.success,
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: theme.accent.success,
    boxShadow: `0 0 6px ${theme.accent.success}`,
  },

  /* Deactivate */
  deactivateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: `${theme.accent.error}12`,
    border: `1px solid ${theme.accent.error}30`,
    borderRadius: '10px',
    color: theme.accent.error,
    fontSize: '13px',
    fontWeight: 600,
  },

  /* Input header */
  licenseInputHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  licenseTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: 0,
  },

  /* Input row */
  licenseRow: {
    display: 'flex',
    gap: '10px',
  },
  licenseInput: {
    flex: 1,
    padding: '12px 14px',
    background: theme.bg.primary,
    border: `2px solid ${theme.border.default}`,
    borderRadius: '10px',
    color: theme.text.primary,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'monospace',
    letterSpacing: '0.3px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box' as const,
    minWidth: 0,
  },
  activateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 18px',
    background: theme.gradient.primary,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },

  /* Get key link */
  getKeyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    fontSize: '12px',
    color: theme.accent.primary,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },

  /* Feedback */
  feedbackError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 12px',
    background: `${theme.accent.error}10`,
    border: `1px solid ${theme.accent.error}30`,
    borderRadius: '8px',
    fontSize: '12px',
    color: theme.accent.error,
    fontWeight: 500,
  },
  feedbackSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 12px',
    background: `${theme.accent.success}10`,
    border: `1px solid ${theme.accent.success}30`,
    borderRadius: '8px',
    fontSize: '12px',
    color: theme.accent.success,
    fontWeight: 500,
  },

  /* Spinner keyframe via inline transform */
  spinIcon: {
    animation: 'spin 1s linear infinite',
  },
};