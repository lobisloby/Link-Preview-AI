// src/shared/utils/cache.ts
import { CacheEntry, LinkPreview } from '../types';

const CACHE_KEY = 'link_preview_cache';
const MAX_CACHE_SIZE = 100;

export class PreviewCache {
  private static instance: PreviewCache;
  private cache: Map<string, CacheEntry<LinkPreview>> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): PreviewCache {
    if (!PreviewCache.instance) {
      PreviewCache.instance = new PreviewCache();
    }
    return PreviewCache.instance;
  }

  private async loadFromStorage(): Promise<void> {
    const result = await chrome.storage.local.get(CACHE_KEY);
    if (result[CACHE_KEY]) {
      const entries = Object.entries(result[CACHE_KEY]) as [string, CacheEntry<LinkPreview>][];
      this.cache = new Map(entries);
      this.cleanExpired();
    }
  }

  private async saveToStorage(): Promise<void> {
    const cacheObj = Object.fromEntries(this.cache);
    await chrome.storage.local.set({ [CACHE_KEY]: cacheObj });
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  async get(url: string): Promise<LinkPreview | null> {
    const entry = this.cache.get(url);
    if (!entry) return null;
    
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(url);
      this.saveToStorage();
      return null;
    }
    
    return entry.data;
  }

  async set(url: string, preview: LinkPreview, ttlHours: number = 24): Promise<void> {
    // Limit cache size
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const entry: CacheEntry<LinkPreview> = {
      data: preview,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    };

    this.cache.set(url, entry);
    await this.saveToStorage();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await chrome.storage.local.remove(CACHE_KEY);
  }
}