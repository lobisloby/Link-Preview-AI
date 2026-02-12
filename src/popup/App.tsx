import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { Stats } from './components/Stats';
import { Subscription } from './components/Subscription';
import { UserSettings, UserSubscription } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { theme } from '@shared/theme';
import { Home, Settings as SettingsIcon, Crown } from 'lucide-react';

type Tab = 'home' | 'settings' | 'subscription';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, subRes] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }),
        chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' }),
      ]);

      setSettings(settingsRes);
      setSubscription(subRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      payload: updates,
    });
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
        <style>{animationStyles}</style>
      </div>
    );
  }

  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'settings' as Tab, label: 'Settings', icon: SettingsIcon },
    { id: 'subscription' as Tab, label: 'Plans', icon: Crown },
  ];

  return (
    <div style={styles.container}>
      <style>{animationStyles}</style>

      {/* ── Fixed Header ── */}
      <div style={styles.headerWrapper}>
        <Header settings={settings} onToggle={updateSettings} />
      </div>

      {/* ── Fixed Navigation ── */}
      <nav style={styles.nav}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navButton,
                background: isActive ? `${theme.accent.primary}15` : 'transparent',
                color: isActive ? theme.accent.primary : theme.text.secondary,
                borderBottom: isActive
                  ? `2px solid ${theme.accent.primary}`
                  : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Scrollable Content ── */}
      <div style={styles.content}>
        {activeTab === 'home' && (
          <Stats
            subscription={subscription}
            onUpgrade={() => setActiveTab('subscription')}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdate={updateSettings}
            subscription={subscription}
          />
        )}
        {activeTab === 'subscription' && (
          <Subscription subscription={subscription} onRefresh={loadData} />
        )}
      </div>

      {/* ── Fixed Footer ── */}
      <footer style={styles.footer}>
        <span>Link Preview AI</span>
        <span style={styles.footerDot}>•</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
};

/* CSS that must live in a <style> tag (keyframes, pseudo-selectors) */
const animationStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Scrollbar inside content area */
  .lp-content::-webkit-scrollbar {
    width: 6px;
  }
  .lp-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .lp-content::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
  .lp-content::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }

  /* Nav button hover */
  .lp-nav-btn:hover {
    background: ${theme.accent.primary}10 !important;
  }
`;

const styles: Record<string, React.CSSProperties> = {
  /* ── Root container: fixed size, column flex ── */
  container: {
    width: '380px',
    height: '560px',
    background: theme.bg.primary,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  /* ── Loading state ── */
  loadingContainer: {
    width: '380px',
    height: '560px',
    background: theme.bg.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  spinner: {
    width: '36px',
    height: '36px',
    border: `3px solid ${theme.bg.tertiary}`,
    borderTopColor: theme.accent.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    color: theme.text.secondary,
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
  },

  /* ── Header wrapper: pinned top ── */
  headerWrapper: {
    flexShrink: 0,
    position: 'relative',
    zIndex: 20,
  },

  /* ── Navigation: pinned below header ── */
  nav: {
    display: 'flex',
    background: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.default}`,
    flexShrink: 0,
    position: 'relative',
    zIndex: 15,
  },

  navButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    margin: 0,
  },

  /* ── Scrollable content: fills remaining space ── */
  content: {
    flex: 1,
    minHeight: 0,          /* ← critical for flex scroll */
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    zIndex: 1,
  },

  /* ── Footer: pinned bottom ── */
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: theme.bg.secondary,
    borderTop: `1px solid ${theme.border.default}`,
    fontSize: '11px',
    color: theme.text.muted,
    fontWeight: 500,
    flexShrink: 0,
    position: 'relative',
    zIndex: 15,
  },

  footerDot: {
    opacity: 0.4,
  },
};