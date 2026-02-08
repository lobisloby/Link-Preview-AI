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
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const isPro = subscription?.tier !== 'free';

  useEffect(() => {
    chrome.storage.local.get('hf_api_key', (result) => {
      if (result.hf_api_key) {
        setApiKey(result.hf_api_key as string);
      }
    });
  }, []);

  const handleAddDomain = () => {
    if (newDomain && !settings.excludedDomains.includes(newDomain)) {
      onUpdate({
        excludedDomains: [...settings.excludedDomains, newDomain.toLowerCase()],
      });
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    onUpdate({
      excludedDomains: settings.excludedDomains.filter(d => d !== domain),
    });
  };

  const handleSaveApiKey = async () => {
    await chrome.storage.local.set({ hf_api_key: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Hover Delay */}
      <SettingSection title="Hover Delay" description="Time before preview appears">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={settings.hoverDelay}
            onChange={(e) => onUpdate({ hoverDelay: Number(e.target.value) })}
            style={{ 
              flex: 1, 
              height: '6px',
              cursor: 'pointer',
              accentColor: '#0284c7'
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 500, 
            color: '#374151',
            minWidth: '60px',
            textAlign: 'right'
          }}>
            {settings.hoverDelay}ms
          </span>
        </div>
      </SettingSection>

      {/* Display Options */}
      <SettingSection title="Display Options" description="Choose what to show in previews">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ToggleOption
            label="Show Category"
            checked={settings.showCategory}
            onChange={(v) => onUpdate({ showCategory: v })}
          />
          <ToggleOption
            label="Show Sentiment"
            checked={settings.showSentiment}
            onChange={(v) => onUpdate({ showSentiment: v })}
            locked={!isPro}
          />
          <ToggleOption
            label="Show Key Points"
            checked={settings.showKeyPoints}
            onChange={(v) => onUpdate({ showKeyPoints: v })}
            locked={!isPro}
          />
          <ToggleOption
            label="Show Reliability"
            checked={settings.showReliability}
            onChange={(v) => onUpdate({ showReliability: v })}
            locked={!isPro}
          />
        </div>
      </SettingSection>

      {/* API Key */}
      <SettingSection title="Hugging Face API Key" description="Required for AI features">
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="hf_xxxxxxxxxxxx"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleSaveApiKey}
            style={{
              padding: '10px 16px',
              background: saved ? '#22c55e' : '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        <p style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          color: '#6b7280' 
        }}>
          Get your free key at{' '}
          <a 
            href="https://huggingface.co/settings/tokens" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0284c7', textDecoration: 'none' }}
          >
            huggingface.co →
          </a>
        </p>
      </SettingSection>

      {/* Excluded Domains */}
      <SettingSection title="Excluded Domains" description="Skip previews for these sites">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            style={{ ...inputStyle, flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <button
            onClick={handleAddDomain}
            style={{
              padding: '10px 16px',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>

        {settings.excludedDomains.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.excludedDomains.map((domain) => (
              <span
                key={domain}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: '#f3f4f6',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#374151'
                }}
              >
                {domain}
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '16px',
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </SettingSection>
    </div>
  );
};

// Setting Section Component
interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, description, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ 
      fontSize: '14px', 
      fontWeight: 600, 
      color: '#111827',
      marginBottom: '4px' 
    }}>
      {title}
    </h3>
    <p style={{ 
      fontSize: '12px', 
      color: '#6b7280',
      marginBottom: '12px' 
    }}>
      {description}
    </p>
    {children}
  </div>
);

// Toggle Option Component
interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ 
  label, 
  checked, 
  onChange,
  locked = false 
}) => (
  <div 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      opacity: locked ? 0.5 : 1
    }}
  >
    <span style={{ fontSize: '14px', color: '#374151' }}>
      {label}
      {locked && (
        <span style={{ 
          marginLeft: '8px', 
          fontSize: '11px', 
          color: '#0284c7',
          fontWeight: 600 
        }}>
          PRO
        </span>
      )}
    </span>
    <button
      onClick={() => !locked && onChange(!checked)}
      disabled={locked}
      style={{
        position: 'relative',
        width: '40px',
        height: '22px',
        background: checked ? '#0284c7' : '#d1d5db',
        borderRadius: '11px',
        border: 'none',
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        padding: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '18px',
          height: '18px',
          background: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      />
    </button>
  </div>
);