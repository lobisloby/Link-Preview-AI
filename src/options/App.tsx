// src/options/App.tsx
import React, { useState, useEffect } from 'react';
import { UserSettings, UserSubscription } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const isWelcome = new URLSearchParams(window.location.search).get('welcome') === 'true';

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

  const handleSave = async () => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      payload: settings,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Link Preview AI</h1>
              <p className="text-white/70">
                {isWelcome ? 'Welcome! Let\'s get you set up.' : 'Extension Settings'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      {isWelcome && (
        <div className="max-w-4xl mx-auto px-6 -mt-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h2 className="font-semibold text-green-800">Installation Successful!</h2>
              <p className="text-sm text-green-600">
                Link Preview AI is now active. Configure your preferences below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="md:col-span-2 space-y-6">
            {/* API Key Setup */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔑 API Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hugging Face API Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="hf_xxxxxxxxxxxx"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get your free API key at{' '}
                    <a 
                      href="https://huggingface.co/settings/tokens" 
                      target="_blank"
                      className="text-primary-600 hover:underline"
                    >
                      huggingface.co/settings/tokens
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Display Settings */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ⚙️ Display Settings
              </h2>
              <div className="space-y-4">
                {/* Hover delay slider and other settings */}
                {/* Similar to popup settings but larger format */}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                saved 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-r from-primary-600 to-accent-600 hover:shadow-lg'
              }`}
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-primary-600 hover:underline text-sm">
                    📖 Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-600 hover:underline text-sm">
                    💬 Get Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-600 hover:underline text-sm">
                    ⭐ Rate Extension
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};