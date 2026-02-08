// src/popup/components/Stats.tsx
import React, { useState, useEffect } from 'react';
import { UserSubscription } from '@shared/types';
import { theme } from '@shared/theme';
import { formatTimeUntilReset } from '@shared/storage';
import { 
  BarChart3, 
  Crown, 
  Clock, 
  Brain, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface StatsProps {
  subscription: UserSubscription | null;
}

export const Stats: React.FC<StatsProps> = ({ subscription }) => {
  const [resetTime, setResetTime] = useState<string>('');

  useEffect(() => {
    const updateResetTime = async () => {
      try {
        const stats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
        if (stats?.resetTime) {
          setResetTime(formatTimeUntilReset(stats.resetTime));
        }
      } catch (error) {
        console.error('Failed to get stats:', error);
      }
    };

    updateResetTime();
    
    // Update every minute
    const interval = setInterval(updateResetTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!subscription) return null;

  const usagePercent = subscription.previewsLimit > 0
    ? (subscription.previewsUsed / subscription.previewsLimit) * 100
    : 0;

  const limitReached = subscription.previewsLimit > 0 && 
                       subscription.previewsUsed >= subscription.previewsLimit;

  const getProgressColor = (): string => {
    if (usagePercent >= 100) return theme.accent.error;
    if (usagePercent >= 90) return theme.accent.error;
    if (usagePercent >= 70) return theme.accent.warning;
    return theme.accent.primary;
  };

  const remaining = Math.max(0, subscription.previewsLimit - subscription.previewsUsed);

  return (
    <div style={styles.container}>
      {/* Limit Reached Banner */}
      {limitReached && (
        <div style={styles.limitBanner}>
          <div style={styles.limitBannerContent}>
            <AlertCircle size={20} color={theme.accent.warning} />
            <div style={styles.limitBannerText}>
              <strong>Daily limit reached</strong>
              <span>Resets in {resetTime || 'a few hours'}</span>
            </div>
          </div>
          <RefreshCw size={16} color={theme.text.muted} />
        </div>
      )}

      {/* Usage Card */}
      <div style={{
        ...styles.card,
        borderColor: limitReached ? `${theme.accent.warning}50` : theme.border.default,
      }}>
        <div style={styles.cardGlow} />

        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <div style={{
              ...styles.iconWrapper,
              background: limitReached ? `${theme.accent.warning}15` : `${theme.accent.primary}15`,
              borderColor: limitReached ? `${theme.accent.warning}30` : `${theme.accent.primary}30`,
            }}>
              <BarChart3 size={18} color={limitReached ? theme.accent.warning : theme.accent.primary} />
            </div>
            <span style={styles.cardTitle}>Today's Usage</span>
          </div>
          <span style={{
            ...styles.badge,
            background: subscription.tier === 'pro' 
              ? `linear-gradient(135deg, ${theme.accent.warning}, #f59e0b)` 
              : theme.bg.tertiary,
            color: subscription.tier === 'pro' ? '#78350f' : theme.text.secondary,
          }}>
            {subscription.tier === 'pro' && <Crown size={10} />}
            {subscription.tier.toUpperCase()}
          </span>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statNumber}>
            <span style={{
              ...styles.statValue,
              color: limitReached ? theme.accent.warning : theme.text.primary,
            }}>
              {subscription.previewsUsed}
            </span>
            <span style={styles.statLimit}>
              / {subscription.previewsLimit === -1 ? '∞' : subscription.previewsLimit}
            </span>
          </div>
          <span style={styles.statLabel}>
            {limitReached ? (
              <span style={{ color: theme.accent.warning }}>
                No previews remaining
              </span>
            ) : (
              `${remaining} preview${remaining !== 1 ? 's' : ''} remaining`
            )}
          </span>
        </div>

        {subscription.previewsLimit > 0 && (
          <div style={styles.progressRow}>
            <div style={styles.progressTrack}>
              <div 
                style={{
                  height: '100%',
                  width: `${Math.min(usagePercent, 100)}%`,
                  background: getProgressColor(),
                  borderRadius: theme.radius.full,
                  transition: 'width 0.5s ease',
                  boxShadow: `0 0 12px ${getProgressColor()}60`,
                }}
              />
            </div>
            <span style={{
              ...styles.progressPercent,
              color: limitReached ? theme.accent.warning : theme.text.secondary,
            }}>
              {Math.round(usagePercent)}%
            </span>
          </div>
        )}

        {/* Reset Timer */}
        {limitReached && resetTime && (
          <div style={styles.resetInfo}>
            <Clock size={14} color={theme.text.muted} />
            <span>Resets in {resetTime}</span>
          </div>
        )}
      </div>

      {/* Tips - Only show if not at limit */}
      {!limitReached && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Sparkles size={16} color={theme.accent.warning} />
            Quick Tips
          </h3>

          <div style={styles.tipsList}>
            <TipCard
              icon={<Clock size={18} color={theme.accent.primary} />}
              title="Hover to Preview"
              desc="Hover over any link to see instant previews"
              accent={theme.accent.primary}
            />
            <TipCard
              icon={<Brain size={18} color={theme.accent.secondary} />}
              title="AI-Powered Analysis"
              desc="Smart summaries using advanced AI models"
              accent={theme.accent.secondary}
            />
            <TipCard
              icon={<ShieldCheck size={18} color={theme.accent.success} />}
              title="Stay Safe Online"
              desc="Reliability scores before clicking links"
              accent={theme.accent.success}
            />
          </div>
        </div>
      )}

      {/* Upgrade CTA - Show prominently when limit reached */}
      {(subscription.tier === 'free' || limitReached) && (
        <div style={{
          ...styles.upgradeCard,
          borderColor: limitReached ? theme.accent.primary : `${theme.accent.primary}40`,
        }}>
          <div style={styles.upgradeGlow} />
          <div style={styles.upgradeContent}>
            <div style={styles.upgradeHeader}>
              <Zap size={20} color={theme.accent.primary} />
              <h3 style={styles.upgradeTitle}>
                {limitReached ? 'Need More Previews?' : 'Upgrade to Pro'}
              </h3>
            </div>
            <p style={styles.upgradeDesc}>
              {limitReached 
                ? 'Get unlimited previews and never hit the limit again!'
                : 'Unlimited previews, advanced AI features & priority support'
              }
            </p>
            <button style={styles.upgradeButton}>
              <Crown size={16} />
              <span>{limitReached ? 'Upgrade Now' : 'View Plans'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TipCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, desc, accent }) => (
  <div style={styles.tipCard}>
    <div style={{
      ...styles.tipIcon,
      background: `${accent}15`,
      border: `1px solid ${accent}30`,
    }}>
      {icon}
    </div>
    <div style={styles.tipContent}>
      <h4 style={styles.tipTitle}>{title}</h4>
      <p style={styles.tipDesc}>{desc}</p>
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  limitBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: `${theme.accent.warning}10`,
    border: `1px solid ${theme.accent.warning}30`,
    borderRadius: theme.radius.lg,
  },

  limitBannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  limitBannerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '13px',
    color: theme.text.primary,
  },

  card: {
    background: theme.bg.secondary,
    borderRadius: theme.radius.xl,
    padding: '20px',
    border: `1px solid ${theme.border.default}`,
    position: 'relative',
    overflow: 'hidden',
  },

  cardGlow: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '150px',
    height: '150px',
    background: `radial-gradient(circle, ${theme.accent.primary}12, transparent 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
  },

  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    flexShrink: 0,
  },

  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: theme.radius.full,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    flexShrink: 0,
  },

  statsRow: {
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
  },

  statNumber: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },

  statValue: {
    fontSize: '40px',
    fontWeight: 800,
    lineHeight: 1,
  },

  statLimit: {
    fontSize: '16px',
    color: theme.text.muted,
    fontWeight: 600,
  },

  statLabel: {
    fontSize: '13px',
    color: theme.text.secondary,
    fontWeight: 500,
    marginTop: '4px',
    display: 'block',
  },

  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    position: 'relative',
    zIndex: 1,
  },

  progressTrack: {
    flex: 1,
    height: '8px',
    background: theme.bg.tertiary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },

  progressPercent: {
    fontSize: '12px',
    fontWeight: 600,
    minWidth: '38px',
    textAlign: 'right',
    flexShrink: 0,
  },

  resetInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.border.default}`,
    fontSize: '12px',
    color: theme.text.muted,
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: 0,
  },

  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  tipCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: theme.bg.secondary,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.border.default}`,
  },

  tipIcon: {
    width: '40px',
    height: '40px',
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  tipContent: {
    flex: 1,
    minWidth: 0,
  },

  tipTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: '0 0 2px 0',
  },

  tipDesc: {
    fontSize: '11px',
    color: theme.text.secondary,
    margin: 0,
    lineHeight: 1.4,
  },

  upgradeCard: {
    background: theme.bg.secondary,
    borderRadius: theme.radius.xl,
    padding: '20px',
    border: `1px solid`,
    position: 'relative',
    overflow: 'hidden',
  },

  upgradeGlow: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    background: `radial-gradient(circle, ${theme.accent.primary}15, transparent 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  upgradeContent: {
    position: 'relative',
    zIndex: 1,
  },

  upgradeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },

  upgradeTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.text.primary,
    margin: 0,
  },

  upgradeDesc: {
    fontSize: '13px',
    color: theme.text.secondary,
    margin: '0 0 16px 0',
    lineHeight: 1.5,
  },

  upgradeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    background: theme.gradient.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme.radius.lg,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: theme.shadow.glow,
  },
};