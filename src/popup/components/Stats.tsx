// src/popup/components/Stats.tsx
import React from 'react';
import { UserSubscription } from '@shared/types';

interface StatsProps {
  subscription: UserSubscription | null;
}

export const Stats: React.FC<StatsProps> = ({ subscription }) => {
  if (!subscription) return null;

  const usagePercent = subscription.previewsLimit > 0
    ? (subscription.previewsUsed / subscription.previewsLimit) * 100
    : 0;

  const getProgressColor = () => {
    if (usagePercent >= 90) return '#ef4444';
    if (usagePercent >= 70) return '#f59e0b';
    return 'linear-gradient(90deg, #0284c7, #c026d3)';
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Usage Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: 600, 
            color: '#1f2937',
            margin: 0 
          }}>
            Today's Usage
          </h3>
          <span 
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: subscription.tier === 'free' ? '#e5e7eb' : '#dbeafe',
              color: subscription.tier === 'free' ? '#4b5563' : '#1d4ed8'
            }}
          >
            {subscription.tier}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            color: '#111827',
            lineHeight: 1 
          }}>
            {subscription.previewsUsed}
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            / {subscription.previewsLimit === -1 ? '∞' : subscription.previewsLimit} previews
          </span>
        </div>

        {/* Progress Bar */}
        {subscription.previewsLimit > 0 && (
          <div 
            style={{
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                height: '100%',
                width: `${Math.min(usagePercent, 100)}%`,
                background: getProgressColor(),
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        )}
      </div>

      {/* Tips */}
      <div>
        <h3 style={{ 
          fontSize: '15px', 
          fontWeight: 600, 
          color: '#1f2937',
          marginBottom: '12px' 
        }}>
          Quick Tips
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TipCard
            icon="⏱️"
            title="Hover to Preview"
            description="Simply hover over any link for a moment to see its preview."
          />
          <TipCard
            icon="🧠"
            title="AI-Powered"
            description="Get smart summaries using Hugging Face's free API."
          />
          <TipCard
            icon="🛡️"
            title="Stay Safe"
            description="See reliability scores before clicking unknown links."
          />
        </div>
      </div>

      {/* Upgrade CTA */}
      {subscription.tier === 'free' && (
        <div 
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #c026d3 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white'
          }}
        >
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            marginBottom: '8px' 
          }}>
            🚀 Upgrade to Pro
          </h3>
          <p style={{ 
            fontSize: '13px', 
            opacity: 0.9, 
            marginBottom: '16px',
            lineHeight: 1.5
          }}>
            Get unlimited previews, advanced AI features, and priority support.
          </p>
          <button 
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#0284c7',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            View Plans
          </button>
        </div>
      )}
    </div>
  );
};

// Tip Card Component
interface TipCardProps {
  icon: string;
  title: string;
  description: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, description }) => (
  <div 
    style={{
      display: 'flex',
      gap: '12px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '12px'
    }}
  >
    <span style={{ fontSize: '24px' }}>{icon}</span>
    <div>
      <h4 style={{ 
        fontSize: '13px', 
        fontWeight: 600, 
        color: '#111827',
        marginBottom: '2px'
      }}>
        {title}
      </h4>
      <p style={{ 
        fontSize: '12px', 
        color: '#6b7280',
        margin: 0,
        lineHeight: 1.4
      }}>
        {description}
      </p>
    </div>
  </div>
);