import React from 'react';
import { UserSettings } from '@shared/types';
import { theme } from '@shared/theme';
import { Zap, ZapOff, Sparkles } from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  onToggle: (updates: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onToggle }) => {
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');

  return (
    <header style={styles.header}>
      {/* Background Glow Effects */}
      <div style={styles.glowBlue} />
      <div style={styles.glowPurple} />

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Logo & Title */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <img
              src={iconUrl}
              alt="Link Preview AI"
              style={styles.logoImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              Link Preview AI
              <Sparkles
                size={14}
                color={theme.accent.warning}
                fill={theme.accent.warning}
                style={{ marginLeft: '8px', flexShrink: 0 }}
              />
            </h1>
            <p style={styles.subtitle}>Know before you click</p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => onToggle({ enabled: !settings.enabled })}
          style={{
            ...styles.toggleButton,
            background: settings.enabled
              ? theme.gradient.primary
              : theme.bg.tertiary,
            boxShadow: settings.enabled ? theme.shadow.glow : 'none',
          }}
        >
          {settings.enabled ? (
            <Zap size={16} fill="white" color="white" />
          ) : (
            <ZapOff size={16} color={theme.text.muted} />
          )}
          <span
            style={{
              ...styles.toggleText,
              color: settings.enabled ? 'white' : theme.text.muted,
            }}
          >
            {settings.enabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <span
            style={{
              ...styles.statusDot,
              background: settings.enabled
                ? theme.accent.success
                : theme.text.muted,
              boxShadow: settings.enabled
                ? `0 0 10px ${theme.accent.success}`
                : 'none',
            }}
          />
          <span style={styles.statusText}>
            {settings.enabled ? 'Active on all websites' : 'Extension paused'}
          </span>
        </div>
        <span style={styles.version}>v1.0.0</span>
      </div>

      {/* Bottom Accent Line */}
      <div style={styles.gradientLine} />
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: theme.bg.secondary,
    position: 'relative',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.border.default}`,
  },

  /* ── Decorative glows (behind content) ── */
  glowBlue: {
    position: 'absolute',
    top: '-80px',
    left: '-40px',
    width: '200px',
    height: '200px',
    background: `radial-gradient(circle, ${theme.accent.primary}20, transparent 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },

  glowPurple: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '180px',
    height: '180px',
    background: `radial-gradient(circle, ${theme.accent.secondary}15, transparent 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* ── Main row: logo + toggle ── */
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 16px 14px',
    position: 'relative',
    zIndex: 2,
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },

  logoContainer: {
    width: '44px',
    height: '44px',
    background: theme.bg.tertiary,
    borderRadius: theme.radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.border.light}`,
    boxShadow: theme.shadow.md,
    padding: '7px',
    overflow: 'hidden',
    flexShrink: 0,
  },

  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: theme.radius.sm,
  },

  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },

  title: {
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.2,
    color: theme.text.primary,
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '-0.3px',
  },

  subtitle: {
    fontSize: '11px',
    margin: 0,
    color: theme.text.secondary,
    fontWeight: 500,
  },

  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    border: 'none',
    borderRadius: theme.radius.full,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 0.3s ease',
    flexShrink: 0,
    marginLeft: '12px',
  },

  toggleText: {
    letterSpacing: '0.5px',
    fontWeight: 700,
  },

  /* ── Status bar ── */
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: `${theme.bg.primary}cc`,
    backdropFilter: 'blur(8px)',
    position: 'relative',
    zIndex: 2,
    borderTop: `1px solid ${theme.border.default}`,
  },

  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },

  statusText: {
    fontSize: '12px',
    fontWeight: 500,
    color: theme.text.secondary,
  },

  version: {
    fontSize: '11px',
    color: theme.text.muted,
    fontWeight: 500,
    flexShrink: 0,
  },

  /* ── Bottom accent line ── */
  gradientLine: {
    height: '2px',
    background: theme.gradient.primary,
    position: 'relative',
    zIndex: 3,
  },
};