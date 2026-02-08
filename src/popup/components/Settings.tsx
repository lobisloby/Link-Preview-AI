import React, { useState, useEffect } from 'react';
import { UserSettings, UserSubscription } from '@shared/types';
import { 
  Clock, 
  Eye, 
  Tag, 
  Smile, 
  Layers, 
  ShieldCheck,
  Key,
  Globe,
  Plus,
  X,
  Check,
  ExternalLink,
  Lock,
  Sliders
} from '@shared/components/Icons';

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
  const [showApiKey, setShowApiKey] = useState(false);
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

  return (
    <div style={{ padding: '16px' }}>
      {/* Hover Delay */}
      <SettingSection 
        icon={<Clock size={18} color="#0284c7" />}
        title="Hover Delay" 
        description="Time before preview appears"
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '12px'
        }}>
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
              accentColor: '#0284c7',
              borderRadius: '3px'
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#0284c7',
            minWidth: '60px',
            textAlign: 'right',
            background: '#dbeafe',
            padding: '4px 10px',
            borderRadius: '8px'
          }}>
            {settings.hoverDelay}ms
          </span>
        </div>
      </SettingSection>

      {/* Display Options */}
      <SettingSection 
        icon={<Sliders size={18} color="#7c3aed" />}
        title="Display Options" 
        description="Choose what to show in previews"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '3px',
          background: '#f8fafc',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <ToggleOption
            icon={<Tag size={16} color="#0284c7" />}
            label="Show Category"
            checked={settings.showCategory}
            onChange={(v) => onUpdate({ showCategory: v })}
          />
          <ToggleOption
            icon={<Smile size={16} color="#f59e0b" />}
            label="Show Sentiment"
            checked={settings.showSentiment}
            onChange={(v) => onUpdate({ showSentiment: v })}
            locked={!isPro}
          />
          <ToggleOption
            icon={<Layers size={16} color="#7c3aed" />}
            label="Show Key Points"
            checked={settings.showKeyPoints}
            onChange={(v) => onUpdate({ showKeyPoints: v })}
            locked={!isPro}
          />
          <ToggleOption
            icon={<ShieldCheck size={16} color="#059669" />}
            label="Show Reliability"
            checked={settings.showReliability}
            onChange={(v) => onUpdate({ showReliability: v })}
            locked={!isPro}
          />
        </div>
      </SettingSection>

      {/* API Key */}
      <SettingSection 
        icon={<Key size={18} color="#f59e0b" />}
        title="Hugging Face API Key" 
        description="Required for AI-powered features"
      >
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_xxxxxxxxxxxx"
              style={{
                width: '100%',
                padding: '12px 40px 12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0284c7'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Eye size={18} />
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            style={{
              padding: '12px 20px',
              background: saved 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #0284c7, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {saved ? <Check size={16} /> : null}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <a 
          href="https://huggingface.co/settings/tokens" 
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px', 
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Get your free API key
          <ExternalLink size={12} />
        </a>
      </SettingSection>

      {/* Excluded Domains */}
      <SettingSection 
        icon={<Globe size={18} color="#ef4444" />}
        title="Excluded Domains" 
        description="Skip previews for these sites"
      >
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: settings.excludedDomains.length > 0 ? '12px' : 0 
        }}>
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            style={{
              flex: 1,
              padding: '12px 14px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
            onFocus={(e) => e.target.style.borderColor = '#0284c7'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleAddDomain}
            disabled={!newDomain}
            style={{
              padding: '12px 16px',
              background: newDomain 
                ? 'linear-gradient(135deg, #0284c7, #7c3aed)' 
                : '#e5e7eb',
              color: newDomain ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: newDomain ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
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
                  gap: '8px',
                  padding: '6px 8px 6px 12px',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#b91c1c',
                  fontWeight: 500
                }}
              >
                {domain}
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  style={{
                    background: '#fecaca',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#b91c1c',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fca5a5'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fecaca'}
                >
                  <X size={12} />
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
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ icon, title, description, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      marginBottom: '6px' 
    }}>
      {icon}
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        color: '#111827',
        margin: 0
      }}>
        {title}
      </h3>
    </div>
    <p style={{ 
      fontSize: '12px', 
      color: '#6b7280',
      marginBottom: '12px',
      marginLeft: '28px'
    }}>
      {description}
    </p>
    {children}
  </div>
);

// Toggle Option Component
interface ToggleOptionProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ 
  icon,
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
      padding: '12px 14px',
      opacity: locked ? 0.6 : 1,
      background: 'white',
      transition: 'background 0.2s',
      cursor: locked ? 'not-allowed' : 'pointer'
    }}
    onClick={() => !locked && onChange(!checked)}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon}
      <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
        {label}
      </span>
      {locked && (
        <span style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          color: '#92400e',
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '10px',
          textTransform: 'uppercase'
        }}>
          <Lock size={10} />
          PRO
        </span>
      )}
    </div>
    <div
      style={{
        position: 'relative',
        width: '44px',
        height: '24px',
        background: checked 
          ? 'linear-gradient(135deg, #0284c7, #7c3aed)' 
          : '#d1d5db',
        borderRadius: '12px',
        transition: 'all 0.3s',
        boxShadow: checked 
          ? '0 0 10px rgba(14, 165, 233, 0.3)' 
          : 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          background: 'white',
          borderRadius: '50%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {checked && <Check size={12} color="#0284c7" />}
      </span>
    </div>
  </div>
);