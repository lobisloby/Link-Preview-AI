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

  return (
    <div className="p-4 space-y-6">
      {/* Usage Card */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Today's Usage</h3>
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium capitalize
            ${subscription.tier === 'free' ? 'bg-gray-200 text-gray-700' : ''}
            ${subscription.tier === 'pro' ? 'bg-primary-200 text-primary-700' : ''}
            ${subscription.tier === 'team' ? 'bg-accent-200 text-accent-700' : ''}
          `}>
            {subscription.tier}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {subscription.previewsUsed}
            </span>
            <span className="text-sm text-gray-500">
              / {subscription.previewsLimit === -1 ? '∞' : subscription.previewsLimit} previews
            </span>
          </div>
          
          {subscription.previewsLimit > 0 && (
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full
                  ${usagePercent >= 90 ? 'bg-red-500' : ''}
                  ${usagePercent >= 70 && usagePercent < 90 ? 'bg-yellow-500' : ''}
                  ${usagePercent < 70 ? 'bg-primary-500' : ''}
                `}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Quick Tips</h3>
        
        <div className="space-y-2">
          <TipCard
            icon="⏱️"
            title="Hover to Preview"
            description="Simply hover over any link for a moment to see its preview."
          />
          <TipCard
            icon="⚙️"
            title="Customize Delay"
            description="Adjust hover delay in settings to match your browsing style."
          />
          <TipCard
            icon="🚫"
            title="Exclude Domains"
            description="Add domains to exclusion list for sites you trust."
          />
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {subscription.tier === 'free' && (
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl p-4 text-white">
          <h3 className="font-semibold mb-2">🚀 Upgrade to Pro</h3>
          <p className="text-sm text-white/80 mb-3">
            Get unlimited previews, advanced AI features, and priority support.
          </p>
          <button 
            onClick={() => chrome.runtime.openOptionsPage()}
            className="w-full bg-white text-primary-600 font-semibold py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            View Plans
          </button>
        </div>
      )}
    </div>
  );
};

interface TipCardProps {
  icon: string;
  title: string;
  description: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, description }) => (
  <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
    <span className="text-xl">{icon}</span>
    <div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);