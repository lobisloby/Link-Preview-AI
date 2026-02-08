import React from 'react';
import { UserSettings } from '@shared/types';
import { Link2, Power } from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  onToggle: (updates: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onToggle }) => {
  return (
    <header style={styles.header}>
      {/* Background Blur Effect */}
      <div style={styles.bgBlur} />
      <div style={styles.bgBlur2} />

      {/* Main Content */}
      <div style={styles.content}>
        {/* Logo & Title */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <Link2 size={24} color="white" strokeWidth={2.5} />
          </div>
          
          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              Link Preview AI
            </h1>
            <p style={styles.subtitle}>
              Smart link previews
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div style={styles.toggleContainer}>
          <span style={styles.toggleLabel}>
            {settings.enabled ? 'ON' : 'OFF'}
          </span>
          <button
            onClick={() => onToggle({ enabled: !settings.enabled })}
            style={{
              ...styles.toggle,
              background: settings.enabled 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(255, 255, 255, 0.2)',
            }}
            aria-label={settings.enabled ? 'Disable' : 'Enable'}
          >
            <span
              style={{
                ...styles.toggleKnob,
                left: settings.enabled ? '26px' : '4px',
                background: settings.enabled 
                  ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' 
                  : 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Power 
                size={12} 
                color={settings.enabled ? 'white' : '#94a3b8'} 
                strokeWidth={2.5}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusIndicator}>
          <span 
            style={{
              ...styles.statusDot,
              background: settings.enabled ? '#4ade80' : '#94a3b8',
              boxShadow: settings.enabled 
                ? '0 0 8px rgba(74, 222, 128, 0.6)' 
                : 'none',
            }}
          />
          <span style={styles.statusText}>
            {settings.enabled ? 'Active on all websites' : 'Extension is paused'}
          </span>
        </div>
        
        <div style={styles.version}>
          v1.0.0
        </div>
      </div>
    </header>
  );
};

// Styles object for cleaner code
const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
    padding: '0',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },

  bgBlur: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    filter: 'blur(40px)',
  },

  bgBlur2: {
    position: 'absolute',
    bottom: '-30px',
    left: '-30px',
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    filter: 'blur(30px)',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  logoContainer: {
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },

  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  title: {
    fontSize: '17px',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.3px',
  },

  subtitle: {
    fontSize: '12px',
    margin: 0,
    opacity: 0.85,
    fontWeight: 500,
  },

  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  toggleLabel: {
    fontSize: '11px',
    fontWeight: 700,
    opacity: 0.9,
    letterSpacing: '0.5px',
  },

  toggle: {
    position: 'relative',
    width: '52px',
    height: '28px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  toggleKnob: {
    position: 'absolute',
    top: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 1,
  },

  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },

  statusText: {
    fontSize: '12px',
    fontWeight: 500,
    opacity: 0.95,
  },

  version: {
    fontSize: '11px',
    opacity: 0.7,
    fontWeight: 500,
  },
};