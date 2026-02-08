// src/popup/components/Settings.tsx
import React, { useState, useEffect } from 'react';
import { UserSettings, UserSubscription } from '@shared/types';
import { theme } from '@shared/theme';
import { 
  Clock, 
  Eye, 
  EyeOff,
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
} from 'lucide-react';

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
    <div style={styles.container}>
      {/* Hover Delay */}
      <Section 
        icon={<Clock size={18} color={theme.accent.primary} />}
        title="Hover Delay"
        desc="Time before preview appears"
      >
        <div style={styles.sliderBox}>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={settings.hoverDelay}
            onChange={(e) => onUpdate({ hoverDelay: Number(e.target.value) })}
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{settings.hoverDelay}ms</span>
        </div>
      </Section>

      {/* Display Options */}
      <Section 
        icon={<Sliders size={18} color={theme.accent.secondary} />}
        title="Display Options"
        desc="What to show in previews"
      >
        <div style={styles.optionsList}>
          <ToggleRow
            icon={<Tag size={16} color={theme.accent.primary} />}
            label="Show Category"
            checked={settings.showCategory}
            onChange={(v) => onUpdate({ showCategory: v })}
          />
          <ToggleRow
            icon={<Smile size={16} color={theme.accent.warning} />}
            label="Show Sentiment"
            checked={settings.showSentiment}
            onChange={(v) => onUpdate({ showSentiment: v })}
            locked={!isPro}
          />
          <ToggleRow
            icon={<Layers size={16} color={theme.accent.secondary} />}
            label="Show Key Points"
            checked={settings.showKeyPoints}
            onChange={(v) => onUpdate({ showKeyPoints: v })}
            locked={!isPro}
          />
          <ToggleRow
            icon={<ShieldCheck size={16} color={theme.accent.success} />}
            label="Show Reliability"
            checked={settings.showReliability}
            onChange={(v) => onUpdate({ showReliability: v })}
            locked={!isPro}
            isLast
          />
        </div>
      </Section>

      {/* API Key */}
      <Section 
        icon={<Key size={18} color={theme.accent.warning} />}
        title="Hugging Face API Key"
        desc="Required for AI features"
      >
        <div style={styles.inputRow}>
          <div style={styles.inputWrapper}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_xxxxxxxxxxxx"
              style={styles.input}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={styles.eyeBtn}
              type="button"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            style={{
              ...styles.saveBtn,
              background: saved ? theme.accent.success : theme.gradient.primary,
            }}
            type="button"
          >
            {saved ? <Check size={16} /> : 'Save'}
          </button>
        </div>
        <a 
          href="https://huggingface.co/settings/tokens" 
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          Get your free API key <ExternalLink size={12} />
        </a>
      </Section>

      {/* Excluded Domains */}
      <Section 
        icon={<Globe size={18} color={theme.accent.error} />}
        title="Excluded Domains"
        desc="Skip previews on these sites"
      >
        <div style={styles.inputRow}>
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            style={styles.inputFull}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <button
            onClick={handleAddDomain}
            disabled={!newDomain}
            style={{
              ...styles.addBtn,
              opacity: newDomain ? 1 : 0.5,
              cursor: newDomain ? 'pointer' : 'not-allowed',
            }}
            type="button"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {settings.excludedDomains.length > 0 && (
          <div style={styles.tagsList}>
            {settings.excludedDomains.map((domain) => (
              <span key={domain} style={styles.tag}>
                {domain}
                <button 
                  onClick={() => handleRemoveDomain(domain)} 
                  style={styles.tagRemove}
                  type="button"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

// Section Component
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, desc, children }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIcon}>{icon}</div>
      <div style={styles.sectionText}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        <p style={styles.sectionDesc}>{desc}</p>
      </div>
    </div>
    {children}
  </div>
);

// Toggle Row Component
interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
  isLast?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ 
  icon, label, checked, onChange, locked = false, isLast = false 
}) => (
  <div 
    style={{
      ...styles.toggleRow,
      borderBottom: isLast ? 'none' : `1px solid ${theme.border.default}`,
      opacity: locked ? 0.5 : 1,
      cursor: locked ? 'not-allowed' : 'pointer',
    }}
    onClick={() => !locked && onChange(!checked)}
  >
    <div style={styles.toggleLeft}>
      {icon}
      <span style={styles.toggleLabel}>{label}</span>
      {locked && (
        <span style={styles.proBadge}>
          <Lock size={9} /> PRO
        </span>
      )}
    </div>
    <div style={{
      ...styles.toggleSwitch,
      background: checked ? theme.gradient.primary : theme.bg.tertiary,
    }}>
      <span style={{
        ...styles.toggleKnob,
        left: checked ? '20px' : '3px',
      }}>
        {checked && <Check size={10} color={theme.accent.primary} />}
      </span>
    </div>
  </div>
);

const PADDING_X = '16px';

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: `16px ${PADDING_X}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  section: {
    background: theme.bg.secondary,
    borderRadius: theme.radius.lg,
    padding: '16px',
    border: `1px solid ${theme.border.default}`,
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '14px',
  },

  sectionIcon: {
    width: '36px',
    height: '36px',
    background: theme.bg.primary,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.border.default}`,
    flexShrink: 0,
  },

  sectionText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
    margin: 0,
  },

  sectionDesc: {
    fontSize: '11px',
    color: theme.text.muted,
    margin: '3px 0 0 0',
  },

  sliderBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: theme.bg.primary,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.border.default}`,
  },

  slider: {
    flex: 1,
    height: '4px',
    cursor: 'pointer',
    accentColor: theme.accent.primary,
    minWidth: 0,
  },

  sliderValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: theme.accent.primary,
    background: `${theme.accent.primary}15`,
    padding: '6px 12px',
    borderRadius: theme.radius.sm,
    minWidth: '65px',
    textAlign: 'center',
    border: `1px solid ${theme.accent.primary}30`,
    flexShrink: 0,
  },

  optionsList: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    border: `1px solid ${theme.border.default}`,
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px',
    background: theme.bg.primary,
    transition: 'background 0.2s ease',
  },

  toggleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },

  toggleLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: theme.text.primary,
  },

  proBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    background: `linear-gradient(135deg, ${theme.accent.warning}30, ${theme.accent.warning}20)`,
    color: theme.accent.warning,
    fontSize: '9px',
    fontWeight: 700,
    borderRadius: theme.radius.full,
    textTransform: 'uppercase',
    border: `1px solid ${theme.accent.warning}40`,
    flexShrink: 0,
  },

  toggleSwitch: {
    position: 'relative',
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    transition: 'all 0.3s ease',
    flexShrink: 0,
    marginLeft: '12px',
  },

  toggleKnob: {
    position: 'absolute',
    top: '3px',
    width: '16px',
    height: '16px',
    background: 'white',
    borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: theme.shadow.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputRow: {
    display: 'flex',
    gap: '10px',
  },

  inputWrapper: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },

  input: {
    width: '100%',
    padding: '12px 40px 12px 14px',
    background: theme.bg.primary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: theme.radius.md,
    color: theme.text.primary,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  inputFull: {
    flex: 1,
    padding: '12px 14px',
    background: theme.bg.primary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: theme.radius.md,
    color: theme.text.primary,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    minWidth: 0,
  },

  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.text.muted,
    display: 'flex',
    padding: 0,
  },

  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 18px',
    border: 'none',
    borderRadius: theme.radius.md,
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '75px',
    flexShrink: 0,
  },

  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    background: theme.gradient.primary,
    border: 'none',
    borderRadius: theme.radius.md,
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },

  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    fontSize: '12px',
    color: theme.accent.primary,
    textDecoration: 'none',
    fontWeight: 500,
  },

  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },

  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px 6px 12px',
    background: `${theme.accent.error}12`,
    border: `1px solid ${theme.accent.error}30`,
    borderRadius: theme.radius.full,
    fontSize: '12px',
    color: theme.accent.error,
    fontWeight: 500,
  },

  tagRemove: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    background: `${theme.accent.error}20`,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: theme.accent.error,
    padding: 0,
    flexShrink: 0,
  },
};