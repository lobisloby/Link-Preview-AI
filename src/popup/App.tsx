// src/popup/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { Stats } from './components/Stats';
import { Subscription } from './components/Subscription';
import { UserSettings, UserSubscription } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { Home, Settings as SettingsIcon, Star } from '@shared/components/Icons';


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
      <div 
        style={{ 
          width: '360px', 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'white'
        }}
      >
        <div 
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#0284c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        width: '360px', 
        minHeight: '500px', 
        maxHeight: '600px',
        display: 'flex', 
        flexDirection: 'column',
        background: 'white',
        overflow: 'hidden'
      }}
    >
      <Header settings={settings} onToggle={updateSettings} />
      
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        background: 'white'
      }}>
        {[
          { id: 'home', label: 'Home', icon: <Home size={16} /> },
          { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
          { id: 'subscription', label: 'Plans', icon: <Star size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab.id 
                ? 'linear-gradient(to bottom, rgba(14, 165, 233, 0.05), transparent)' 
                : 'transparent',
              color: activeTab === tab.id ? '#0284c7' : '#6b7280',
              borderBottom: activeTab === tab.id 
                ? '2px solid #0284c7' 
                : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {activeTab === 'home' && (
          <Stats subscription={subscription} />
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            settings={settings} 
            onUpdate={updateSettings}
            subscription={subscription}
          />
        )}
        
        {activeTab === 'subscription' && (
          <Subscription 
            subscription={subscription}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* Footer */}
      <footer style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <span>Link Preview AI v1.0.0</span>
        <a 
          href="https://linkpreviewai.com/help" 
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0284c7', textDecoration: 'none' }}
        >
          Help & Feedback
        </a>
      </footer>
    </div>
  );
};