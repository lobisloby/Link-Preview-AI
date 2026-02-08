import React from 'react';
import { UserSubscription } from '@shared/types';
import { 
  Clock, 
  Brain, 
  ShieldCheck, 
  Zap, 
  Star,
  TrendingUp,
  Crown,
  Sparkles,
  BarChart3
} from '@shared/components/Icons';

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
    return 'url(#gradient)';
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Usage Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fdf4ff 100%)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(14, 165, 233, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <div 
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(192, 38, 211, 0.1))',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#0284c7" />
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              color: '#1f2937',
              margin: 0 
            }}>
              Today's Usage
            </h3>
          </div>
          <span 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: subscription.tier === 'free' 
                ? 'linear-gradient(135deg, #e5e7eb, #d1d5db)' 
                : 'linear-gradient(135deg, #fef3c7, #fde68a)',
              color: subscription.tier === 'free' ? '#4b5563' : '#92400e',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {subscription.tier === 'pro' && <Crown size={12} />}
            {subscription.tier}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ 
              fontSize: '42px', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1 
            }}>
              {subscription.previewsUsed}
            </span>
          </div>
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            / {subscription.previewsLimit === -1 ? '∞' : subscription.previewsLimit} previews
          </span>
        </div>

        {/* Progress Bar */}
        {subscription.previewsLimit > 0 && (
          <div 
            style={{
              height: '10px',
              background: '#e5e7eb',
              borderRadius: '5px',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c026d3" />
                </linearGradient>
              </defs>
            </svg>
            <div 
              style={{
                height: '100%',
                width: `${Math.min(usagePercent, 100)}%`,
                background: getProgressColor(),
                borderRadius: '5px',
                transition: 'width 0.5s ease',
                boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)'
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
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} color="#f59e0b" />
          Quick Tips
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TipCard
            icon={<Clock size={22} color="#0284c7" />}
            title="Hover to Preview"
            description="Simply hover over any link for a moment to see its preview."
            color="#dbeafe"
          />
          <TipCard
            icon={<Brain size={22} color="#7c3aed" />}
            title="AI-Powered Analysis"
            description="Get smart summaries using Hugging Face's free API."
            color="#ede9fe"
          />
          <TipCard
            icon={<ShieldCheck size={22} color="#059669" />}
            title="Stay Safe Online"
            description="See reliability scores before clicking unknown links."
            color="#d1fae5"
          />
        </div>
      </div>

      {/* Upgrade CTA */}
      {subscription.tier === 'free' && (
        <div 
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 50%, #c026d3 100%)',
            borderRadius: '20px',
            padding: '20px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            opacity: 0.2
          }}>
            <Star size={60} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Zap size={20} />
            <h3 style={{ 
              fontSize: '17px', 
              fontWeight: 700, 
              margin: 0
            }}>
              Upgrade to Pro
            </h3>
          </div>
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
              padding: '14px',
              background: 'white',
              color: '#7c3aed',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            <Crown size={16} />
            View Plans
            <TrendingUp size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Tip Card Component
interface TipCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, description, color }) => (
  <div 
    style={{
      display: 'flex',
      gap: '14px',
      padding: '14px',
      background: color,
      borderRadius: '14px',
      alignItems: 'flex-start',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
  >
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <h4 style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        color: '#111827',
        marginBottom: '3px'
      }}>
        {title}
      </h4>
      <p style={{ 
        fontSize: '12px', 
        color: '#4b5563',
        margin: 0,
        lineHeight: 1.4
      }}>
        {description}
      </p>
    </div>
  </div>
);