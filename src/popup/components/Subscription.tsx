// src/popup/components/Subscription.tsx
import React, { useState } from 'react';
import { UserSubscription } from '@shared/types';
import { lemonSqueezyService } from '@shared/api/lemonSqueezy';
import { SUBSCRIPTION_LIMITS } from '@shared/constants';

interface SubscriptionProps {
  subscription: UserSubscription | null;
  onRefresh: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ 
  subscription,
  onRefresh 
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    
    setValidating(true);
    setError('');
    
    try {
      const result = await lemonSqueezyService.validateLicense(licenseKey);
      
      if (result) {
        await chrome.storage.sync.set({ subscription: result });
        onRefresh();
        setLicenseKey('');
      } else {
        setError('Invalid license key. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate license. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['25 previews/day', 'Basic summarization', 'Link categorization'],
      current: subscription?.tier === 'free',
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
        'Reliability scoring',
        'Multi-language support',
        'Priority support',
      ],
      current: subscription?.tier === 'pro',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$15',
      period: '/month',
      features: [
        'Unlimited previews',
        'Everything in Pro',
        'Team management',
        'Usage analytics',
        'Custom branding',
        'API access',
        'Dedicated support',
      ],
      current: subscription?.tier === 'team',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-xl font-bold text-gray-900 capitalize">
              {subscription?.tier || 'Free'}
            </p>
          </div>
          {subscription?.tier !== 'free' && subscription?.expiresAt && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Renews on</p>
              <p className="font-medium text-gray-900">
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative rounded-xl border-2 p-4 transition-all
              ${plan.current 
                ? 'border-primary-500 bg-primary-50/50' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${plan.popular && !plan.current ? 'ring-2 ring-accent-500 ring-offset-2' : ''}
            `}
          >
            {plan.popular && !plan.current && (
              <span className="absolute -top-2 left-4 px-2 py-0.5 bg-accent-500 text-white text-xs font-medium rounded-full">
                Popular
              </span>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">
                    {plan.period}
                  </span>
                </p>
              </div>
              
              {plan.current ? (
                <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  Current
                </span>
              ) : plan.id !== 'free' && (
                <button
                  onClick={() => {
                    const url = lemonSqueezyService.getCheckoutUrl(plan.id as 'pro' | 'team');
                    chrome.tabs.create({ url });
                  }}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Upgrade
                </button>
              )}
            </div>

            <ul className="mt-3 space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* License Key Activation */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-medium text-gray-900 mb-2">Have a license key?</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter license key"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleActivate}
            disabled={validating || !licenseKey.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? 'Validating...' : 'Activate'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};