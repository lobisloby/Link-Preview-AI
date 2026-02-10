// src/shared/api/lemonSqueezy.ts
import { UserSubscription } from '../types';
import { SUBSCRIPTION_LIMITS } from '../constants';

interface StoredData {
  subscription?: UserSubscription;
  usage_date?: string;
  usage_count?: number;
}

interface LicenseActivationResult {
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}

interface LicenseDeactivationResult {
  success: boolean;
  error?: string;
}

export class LemonSqueezyService {

  // ─── Activate a license key against the LS API ───────────────────
  async activateLicense(licenseKey: string): Promise<LicenseActivationResult> {
    try {
      const response = await fetch(
        'https://api.lemonsqueezy.com/v1/licenses/activate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            license_key: licenseKey,
            instance_name: 'Link Preview AI Extension',
          }),
        }
      );

      const data = await response.json();

      // ── Activation succeeded ──
      if (data.activated) {
        const subscription = this.buildSubscription(data, licenseKey);
        await chrome.storage.sync.set({ subscription });
        return { success: true, subscription };
      }

      // ── Activation failed but key might already be active ──
      // e.g. "This license key has reached its activation limit."
      // Fall back to validate so an already-activated key still works.
      const validated = await this.validateLicense(licenseKey);
      if (validated) {
        await chrome.storage.sync.set({ subscription: validated });
        return { success: true, subscription: validated };
      }

      return {
        success: false,
        error: data.error || 'Invalid license key. Please check and try again.',
      };
    } catch (error) {
      console.error('License activation error:', error);
      return {
        success: false,
        error: 'Network error — please check your connection and try again.',
      };
    }
  }

  // ─── Deactivate the current license ──────────────────────────────
  async deactivateLicense(): Promise<LicenseDeactivationResult> {
    try {
      const stored = await chrome.storage.sync.get('subscription');
      const sub = stored.subscription as UserSubscription | undefined;

      // If we have the key + instance, tell Lemon Squeezy
      if (sub?.licenseKey && sub?.instanceId) {
        try {
          await fetch(
            'https://api.lemonsqueezy.com/v1/licenses/deactivate',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                license_key: sub.licenseKey,
                instance_id: sub.instanceId,
              }),
            }
          );
        } catch {
          // Even if the remote call fails, clear locally
        }
      }

      await this.clearSubscription();
      return { success: true };
    } catch (error) {
      console.error('License deactivation error:', error);
      await this.clearSubscription();
      return { success: true };
    }
  }

  // ─── Validate (unchanged API surface, improved internals) ────────
  async validateLicense(licenseKey: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch(
        'https://api.lemonsqueezy.com/v1/licenses/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ license_key: licenseKey }),
        }
      );

      // LS returns 4xx for truly invalid keys
      if (!response.ok) return null;

      const data = await response.json();
      if (!data.valid) return null;

      return this.buildSubscription(data, licenseKey);
    } catch (error) {
      console.error('License validation error:', error);
      return null;
    }
  }

  // ─── Default subscription (reads from storage) ──────────────────
  async getDefaultSubscription(): Promise<UserSubscription> {
    const stored: StoredData = await chrome.storage.sync.get([
      'subscription',
      'usage_date',
      'usage_count',
    ]);

    const today = new Date().toDateString();
    const usageCount: number =
      stored.usage_date === today ? (stored.usage_count ?? 0) : 0;

    if (stored.subscription && stored.subscription.tier !== 'free') {
      // ── Check expiry ──
      if (
        stored.subscription.expiresAt &&
        stored.subscription.expiresAt < Date.now()
      ) {
        await this.clearSubscription();
        return this.freeSubscription(usageCount);
      }

      return { ...stored.subscription, previewsUsed: usageCount };
    }

    return this.freeSubscription(usageCount);
  }

  // ─── Usage tracking (unchanged) ─────────────────────────────────
  async incrementUsage(): Promise<boolean> {
    const subscription = await this.getDefaultSubscription();

    if (subscription.tier === 'team') return true;

    if (subscription.previewsUsed >= subscription.previewsLimit) {
      return false;
    }

    const today = new Date().toDateString();
    const stored: StoredData = await chrome.storage.sync.get([
      'usage_date',
      'usage_count',
    ]);

    const currentCount: number =
      stored.usage_date === today ? (stored.usage_count ?? 0) : 0;

    await chrome.storage.sync.set({
      usage_date: today,
      usage_count: currentCount + 1,
    });

    return true;
  }

  // ─── Feature gating (unchanged) ─────────────────────────────────
  async canUseFeature(feature: string): Promise<boolean> {
    const subscription = await this.getDefaultSubscription();
    const tierFeatures = SUBSCRIPTION_LIMITS[subscription.tier].features;
    return tierFeatures.includes('all') || tierFeatures.includes(feature);
  }

  // ─── Private helpers ────────────────────────────────────────────
  private determineTier(meta: Record<string, unknown> | undefined): 'pro' | 'team' {
    const variant = String(meta?.variant_name ?? '').toLowerCase();
    const product = String(meta?.product_name ?? '').toLowerCase();
    if (variant.includes('team') || product.includes('team')) return 'team';
    return 'pro';
  }

  private buildSubscription(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    licenseKey: string
  ): UserSubscription {
    const tier = this.determineTier(data.meta);
    return {
      tier,
      expiresAt: data.license_key?.expires_at
        ? new Date(data.license_key.expires_at).getTime()
        : null,
      previewsUsed: 0,
      previewsLimit: SUBSCRIPTION_LIMITS[tier].previewsPerDay,
      lemonSqueezyId: data.license_key?.id?.toString(),
      licenseKey,
      instanceId: data.instance?.id,
    };
  }

  private async clearSubscription(): Promise<void> {
    await chrome.storage.sync.set({
      subscription: this.freeSubscription(0),
    });
  }

  private freeSubscription(previewsUsed: number): UserSubscription {
    return {
      tier: 'free',
      expiresAt: null,
      previewsUsed,
      previewsLimit: SUBSCRIPTION_LIMITS.free.previewsPerDay,
    };
  }
}

export const lemonSqueezyService = new LemonSqueezyService();