// src/popup/App.tsx
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
        <style>{scrollbarStyles}</style>
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
      {/* Inject scrollbar styles */}
      <style>{scrollbarStyles}</style>
      
      {/* Header */}
      <Header settings={settings} onToggle={updateSettings} />
      
      {/* Navigation */}
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
                  : `2px solid transparent`,
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content - with custom scrollbar */}
      <div style={styles.content}>
        {activeTab === 'home' && <Stats subscription={subscription} onUpgrade={() => setActiveTab('subscription')} />}
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

      {/* Footer */}
      <footer style={styles.footer}>
        <span>Link Preview AI</span>
        <span style={styles.footerDot}>•</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
};

// Scrollbar CSS injected via style tag
const scrollbarStyles = `
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #475569 #0f172a;
  }
  
  /* Chrome, Edge, Safari */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0f172a;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
  
  ::-webkit-scrollbar-corner {
    background: #0f172a;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '380px',
    minHeight: '520px',
    maxHeight: '600px',
    background: theme.bg.primary,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  loadingContainer: {
    width: '380px',
    height: '520px',
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

  nav: {
    display: 'flex',
    background: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.default}`,
    paddingLeft: '0',
    paddingRight: '0',
  },

  navButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    margin: 0,
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 16px',
    background: theme.bg.secondary,
    borderTop: `1px solid ${theme.border.default}`,
    fontSize: '11px',
    color: theme.text.muted,
    fontWeight: 500,
  },

  footerDot: {
    opacity: 0.4,
  },
};