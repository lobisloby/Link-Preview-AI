// src/popup/components/Settings.tsx
import React, { useState, useEffect } from 'react';
import { UserSettings, UserSubscription } from '@shared/types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  subscription: UserSubscription | null;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdate,
  subscription 
}) => {
  const [newDomain, setNewDomain] = useState('');
  const isPro = subscription?.tier !== 'free';

  const handleAddDomain = () => {
    if (newDomain && !settings.excludedDomains.includes(newDomain)) {
      onUpdate({
        excludedDomains: [...settings.excludedDomains, newDomain],
      });
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    onUpdate({
      excludedDomains: settings.excludedDomains.filter(d => d !== domain),
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Hover Delay */}
      <SettingGroup title="Hover Delay" description="Time before preview appears">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={settings.hoverDelay}
            onChange={(e) => onUpdate({ hoverDelay: Number(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <span className="text-sm font-medium text-gray-700 w-16">
            {settings.hoverDelay}ms
          </span>
        </div>
      </SettingGroup>

      {/* Display Options */}
      <SettingGroup title="Display Options" description="Choose what to show in previews">
        <div className="space-y-3">
          <SettingToggle
            label="Show Category"
            enabled={settings.showCategory}
            onChange={(showCategory) => onUpdate({ showCategory })}
          />
          <SettingToggle
            label="Show Sentiment"
            enabled={settings.showSentiment}
            onChange={(showSentiment) => onUpdate({ showSentiment })}
            locked={!isPro}
          />
          <SettingToggle
            label="Show Key Points"
            enabled={settings.showKeyPoints}
            onChange={(showKeyPoints) => onUpdate({ showKeyPoints })}
            locked={!isPro}
          />
          <SettingToggle
            label="Show Reliability Score"
            enabled={settings.showReliability}
            onChange={(showReliability) => onUpdate({ showReliability })}
            locked={!isPro}
          />
        </div>
      </SettingGroup>

      {/* Theme */}
      <SettingGroup title="Theme" description="Choose your preferred appearance">
        <div className="flex gap-2">
          {(['auto', 'light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onUpdate({ theme })}
              className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors
                ${settings.theme === theme 
                  ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {theme}
            </button>
          ))}
        </div>
      </SettingGroup>

      {/* Excluded Domains */}
      <SettingGroup title="Excluded Domains" description="Links from these domains won't show previews">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <button
              onClick={handleAddDomain}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>

          {settings.excludedDomains.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.excludedDomains.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {domain}
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-300 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </SettingGroup>

      {/* API Key */}
      <SettingGroup title="Hugging Face API Key" description="Your API key for AI features">
        <ApiKeyInput />
      </SettingGroup>
    </div>
  );
};

interface SettingGroupProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingGroup: React.FC<SettingGroupProps> = ({ title, description, children }) => (
  <div className="space-y-2">
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {children}
  </div>
);

interface SettingToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  locked?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ 
  label, 
  enabled, 
  onChange,
  locked = false 
}) => (
  <label className={`flex items-center justify-between ${locked ? 'opacity-50' : ''}`}>
    <span className="text-sm text-gray-700">
      {label}
      {locked && (
        <span className="ml-2 text-xs text-primary-600 font-medium">PRO</span>
      )}
    </span>
    <button
      role="switch"
      aria-checked={enabled}
      disabled={locked}
      onClick={() => !locked && onChange(!enabled)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${enabled ? 'bg-primary-600' : 'bg-gray-300'}
        ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-4' : 'translate-x-1'}
        `}
      />
    </button>
  </label>
);

const ApiKeyInput: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('hf_api_key', (result) => {
      if (result.hf_api_key) {
        setApiKey(result.hf_api_key as string);
      }
    });
  }, []);

  const handleSave = async () => {
    await chrome.storage.local.set({ hf_api_key: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="hf_xxxxxxxxxxxx"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Get your free API key at{' '}
        <a 
          href="https://huggingface.co/settings/tokens" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline"
        >
          huggingface.co
        </a>
      </p>
    </div>
  );
};