// src/popup/components/Subscription.tsx
import React, { useState } from 'react';
import { UserSubscription } from '@shared/types';
import { theme } from '@shared/theme';
import { Crown, Check, Zap, Star } from 'lucide-react';

interface SubscriptionProps {
  subscription: UserSubscription | null;
  onRefresh: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ 
  subscription,
  onRefresh 
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['25 previews/day', 'Basic summaries', 'Category detection'],
    },
    {
      id: 'pro',
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

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }
    // Add license activation logic here
    setError('');
  };

  return (
    <div style={styles.container}>
      {/* Current Plan Card */}
      <div style={styles.currentPlan}>
        <div style={styles.currentPlanGlow} />
        <div style={styles.currentPlanContent}>
          <div style={styles.currentPlanLeft}>
            <span style={styles.currentPlanLabel}>Current Plan</span>
            <span style={styles.currentPlanName}>
              {subscription?.tier === 'pro' && <Crown size={18} color="#fbbf24" />}
              {(subscription?.tier || 'free').toUpperCase()}
            </span>
          </div>
          {subscription?.tier === 'pro' && subscription.expiresAt && (
            <div style={styles.currentPlanRight}>
              <span style={styles.renewsLabel}>Renews</span>
              <span style={styles.renewsDate}>
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Plans */}
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
                ) : plan.id !== 'free' && (
                  <button style={styles.upgradeBtn}>
                    <Zap size={14} />
                    Upgrade
                  </button>
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

      {/* License Key */}
      <div style={styles.licenseSection}>
        <h3 style={styles.licenseTitle}>Have a license key?</h3>
        <div style={styles.licenseRow}>
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter license key"
            style={styles.licenseInput}
          />
          <button onClick={handleActivate} style={styles.activateBtn}>
            Activate
          </button>
        </div>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

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
    textAlign: 'right',
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

  licenseSection: {
    background: theme.bg.secondary,
    borderRadius: '14px',
    padding: '16px',
    border: `1px solid ${theme.border.default}`,
  },

  licenseTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: '0 0 12px 0',
  },

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
  },

  activateBtn: {
    padding: '12px 18px',
    background: theme.gradient.primary,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  errorText: {
    marginTop: '10px',
    fontSize: '12px',
    color: theme.accent.error,
    margin: '10px 0 0 0',
  },
};