// src/shared/storage.ts
import type { UserSettings, UserSubscription, UserStats } from './types';
import { DEFAULT_SETTINGS } from './constants';

// Subscription limits per tier
const SUBSCRIPTION_LIMITS: Record<string, number> = {
  free: 25,
  pro: 500,
  team: -1, // unlimited
};

// ==================== SETTINGS ====================

export async function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      resolve({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  });
}

export async function saveSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  
  return new Promise((resolve) => {
    chrome.storage.sync.set({ settings: updated }, () => {
      resolve(updated);
    });
  });
}

// ==================== SUBSCRIPTION ====================

export async function getSubscription(): Promise<UserSubscription> {
  const result = await chrome.storage.sync.get('subscription');
  const stats = await getUsageStats();
  
  const tier = result.subscription?.tier || 'free';
  
  return {
    tier,
    expiresAt: result.subscription?.expiresAt || null,
    previewsUsed: stats.previewsToday,
    previewsLimit: SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free,
    lemonSqueezyId: result.subscription?.lemonSqueezyId,
  };
}

export async function saveSubscription(subscription: Partial<UserSubscription>): Promise<void> {
  const current = await chrome.storage.sync.get('subscription');
  const updated = { ...current.subscription, ...subscription };
  
  return new Promise((resolve) => {
    chrome.storage.sync.set({ subscription: updated }, () => {
      resolve();
    });
  });
}

// ==================== USAGE STATS ====================

export async function getUsageStats(): Promise<UserStats> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usage_date', 'usage_count', 'subscription'], (result) => {
      const today = new Date().toDateString();
      const tier = result.subscription?.tier || 'free';
      const limit = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
      
      // Reset count if new day
      if (result.usage_date !== today) {
        chrome.storage.local.set({ 
          usage_date: today, 
          usage_count: 0 
        });
        
        resolve({
          previewsToday: 0,
          previewsLimit: limit,
          tier,
          limitReached: false,
          resetTime: getNextResetTime(),
        });
        return;
      }
      
      const count = result.usage_count || 0;
      const limitReached = limit !== -1 && count >= limit;
      
      resolve({
        previewsToday: count,
        previewsLimit: limit,
        tier,
        limitReached,
        resetTime: getNextResetTime(),
      });
    });
  });
}

// ==================== LIMIT CHECKING ====================

export async function checkLimit(): Promise<{ 
  canUse: boolean; 
  remaining: number; 
  resetTime: number;
  limitReached: boolean;
}> {
  const stats = await getUsageStats();
  
  // Unlimited for team tier
  if (stats.previewsLimit === -1) {
    return { 
      canUse: true, 
      remaining: -1, 
      resetTime: stats.resetTime,
      limitReached: false,
    };
  }
  
  const remaining = Math.max(0, stats.previewsLimit - stats.previewsToday);
  const canUse = remaining > 0;
  
  return { 
    canUse, 
    remaining, 
    resetTime: stats.resetTime,
    limitReached: !canUse,
  };
}

export async function incrementUsage(): Promise<{ 
  success: boolean; 
  remaining: number; 
  limitReached: boolean;
}> {
  const { canUse } = await checkLimit();
  
  if (!canUse) {
    return { success: false, remaining: 0, limitReached: true };
  }
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['usage_date', 'usage_count', 'subscription'], (result) => {
      const today = new Date().toDateString();
      const tier = result.subscription?.tier || 'free';
      const limit = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
      
      const newCount = result.usage_date === today 
        ? (result.usage_count || 0) + 1 
        : 1;
      
      chrome.storage.local.set({
        usage_date: today,
        usage_count: newCount,
      }, () => {
        const remaining = limit === -1 ? -1 : Math.max(0, limit - newCount);
        const limitReached = limit !== -1 && newCount >= limit;
        
        resolve({ 
          success: true, 
          remaining,
          limitReached,
        });
      });
    });
  });
}

// ==================== HELPERS ====================

function getNextResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

export function formatTimeUntilReset(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff <= 0) return 'now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ==================== CACHE ====================

const CACHE_KEY = 'link_preview_cache';
const MAX_CACHE_SIZE = 100;
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export async function getCachedPreview(url: string): Promise<unknown | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(CACHE_KEY, (result) => {
      const cache = result[CACHE_KEY] || {};
      const entry = cache[url] as CacheEntry<unknown> | undefined;
      
      if (!entry) {
        resolve(null);
        return;
      }
      
      // Check if expired
      if (entry.expiresAt < Date.now()) {
        // Remove expired entry
        delete cache[url];
        chrome.storage.local.set({ [CACHE_KEY]: cache });
        resolve(null);
        return;
      }
      
      resolve(entry.data);
    });
  });
}

export async function setCachedPreview(url: string, data: unknown, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(CACHE_KEY, (result) => {
      const cache = result[CACHE_KEY] || {};
      
      // Limit cache size
      const keys = Object.keys(cache);
      if (keys.length >= MAX_CACHE_SIZE) {
        // Remove oldest entries
        const sortedKeys = keys.sort((a, b) => {
          return (cache[a]?.timestamp || 0) - (cache[b]?.timestamp || 0);
        });
        
        // Remove oldest 10%
        const toRemove = Math.ceil(MAX_CACHE_SIZE * 0.1);
        for (let i = 0; i < toRemove; i++) {
          delete cache[sortedKeys[i]];
        }
      }
      
      cache[url] = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      
      chrome.storage.local.set({ [CACHE_KEY]: cache }, () => {
        resolve();
      });
    });
  });
}

export async function clearCache(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(CACHE_KEY, () => {
      resolve();
    });
  });
}