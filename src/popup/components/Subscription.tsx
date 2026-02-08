// src/popup/components/Subscription.tsx
import React, { useState } from 'react';
import { UserSubscription } from '@shared/types';

interface SubscriptionProps {
  subscription: UserSubscription | null;
  onRefresh: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ 
  subscription,
  onRefresh 
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['25 previews/day', 'Basic summaries', 'Category detection'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$5',
      period: '/month',
      features: [
        '500 previews/day',
        'Advanced AI analysis',
        'Sentiment detection',
        'Key points extraction',
        'Priority support',
      ],
      popular: true,
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {/* Current Plan */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Current Plan
            </p>
            <p style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: '#111827',
              textTransform: 'capitalize' 
            }}>
              {subscription?.tier || 'Free'}
            </p>
          </div>
          {subscription?.tier === 'pro' && subscription.expiresAt && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Renews
              </p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {plans.map((plan) => {
          const isCurrent = subscription?.tier === plan.id;
          
          return (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                border: isCurrent ? '2px solid #0284c7' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                background: isCurrent ? 'rgba(14, 165, 233, 0.05)' : 'white'
              }}
            >
              {plan.popular && !isCurrent && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '16px',
                    padding: '2px 10px',
                    background: '#c026d3',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '10px'
                  }}
                >
                  POPULAR
                </span>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                    {plan.price}
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>
                      {plan.period}
                    </span>
                  </p>
                </div>
                
                {isCurrent ? (
                  <span 
                    style={{
                      padding: '6px 12px',
                      background: '#0284c7',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '20px'
                    }}
                  >
                    Current
                  </span>
                ) : plan.id !== 'free' && (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade
                  </button>
                )}
              </div>

              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {plan.features.map((feature, i) => (
                  <li 
                    key={i}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '13px',
                      color: '#4b5563'
                    }}
                  >
                    <span style={{ color: '#22c55e' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* License Key */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
          Have a license key?
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter license key"
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
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
            Activate
          </button>
        </div>
        {error && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};