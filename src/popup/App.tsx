// src/popup/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { Stats } from './components/Stats';
import { Subscription } from './components/Subscription';
import { UserSettings, UserSubscription } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';

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
      <div className="w-[360px] h-[500px] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-[360px] min-h-[500px] bg-white flex flex-col">
      <Header settings={settings} onToggle={updateSettings} />
      
      {/* Navigation */}
      <nav className="flex border-b border-gray-200">
        {(['home', 'settings', 'subscription'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors
              ${activeTab === tab 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
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
      <footer className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Link Preview AI v1.0.0</span>
          <a 
            href="https://linkpreviewai.com/help" 
            target="_blank"
            className="hover:text-primary-600"
          >
            Help & Feedback
          </a>
        </div>
      </footer>
    </div>
  );
};