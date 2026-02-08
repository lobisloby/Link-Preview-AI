// src/shared/api/lemonSqueezy.ts
import { UserSubscription } from '../types';
import { LEMON_SQUEEZY_CONFIG, SUBSCRIPTION_LIMITS } from '../constants';

interface StoredData {
  subscription?: UserSubscription;
  usage_date?: string;
  usage_count?: number;
}

export class LemonSqueezyService {
  getCheckoutUrl(tier: 'pro' | 'team', email?: string): string {
    const params = new URLSearchParams({
      checkout: 'true',
      media: '0',
      embed: '1',
    });

    if (email) {
      params.append('checkout[email]', email);
    }

    const variantId = tier === 'pro' 
      ? LEMON_SQUEEZY_CONFIG.proVariantId 
      : LEMON_SQUEEZY_CONFIG.teamVariantId;

    return `${LEMON_SQUEEZY_CONFIG.checkoutUrl}${variantId}?${params.toString()}`;
  }

  async validateLicense(licenseKey: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      if (!data.valid) return null;

      const tier: 'pro' | 'team' = data.meta?.variant_name?.toLowerCase().includes('team') ? 'team' : 'pro';
      
      return {
        tier,
        expiresAt: data.license_key?.expires_at 
          ? new Date(data.license_key.expires_at).getTime() 
          : null,
        previewsUsed: 0,
        previewsLimit: SUBSCRIPTION_LIMITS[tier].previewsPerDay,
        lemonSqueezyId: data.license_key?.id,
      };
    } catch (error) {
      console.error('License validation error:', error);
      return null;
    }
  }

  async getDefaultSubscription(): Promise<UserSubscription> {
    const stored: StoredData = await chrome.storage.sync.get(['subscription', 'usage_date', 'usage_count']);
    
    const today = new Date().toDateString();
    const usageCount: number = stored.usage_date === today ? (stored.usage_count ?? 0) : 0;

    if (stored.subscription && stored.subscription.tier !== 'free') {
      return {
        ...stored.subscription,
        previewsUsed: usageCount,
      };
    }

    return {
      tier: 'free',
      expiresAt: null,
      previewsUsed: usageCount,
      previewsLimit: SUBSCRIPTION_LIMITS.free.previewsPerDay,
    };
  }

  async incrementUsage(): Promise<boolean> {
    const subscription = await this.getDefaultSubscription();
    
    if (subscription.tier === 'team') return true; // Unlimited
    
    if (subscription.previewsUsed >= subscription.previewsLimit) {
      return false; // Limit reached
    }

    const today = new Date().toDateString();
    const stored: StoredData = await chrome.storage.sync.get(['usage_date', 'usage_count']);
    
    const currentCount: number = stored.usage_date === today 
      ? (stored.usage_count ?? 0) 
      : 0;
    
    const newCount = currentCount + 1;

    await chrome.storage.sync.set({
      usage_date: today,
      usage_count: newCount,
    });

    return true;
  }

  async canUseFeature(feature: string): Promise<boolean> {
    const subscription = await this.getDefaultSubscription();
    const tierFeatures = SUBSCRIPTION_LIMITS[subscription.tier].features;
    
    return tierFeatures.includes('all') || tierFeatures.includes(feature);
  }
}

export const lemonSqueezyService = new LemonSqueezyService();