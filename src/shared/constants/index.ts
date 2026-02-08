// src/shared/constants/index.ts

import type { UserSettings } from '../types';

export const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';

export const MODELS = {
  summarization: 'facebook/bart-large-cnn',
  classification: 'facebook/bart-large-mnli',
  sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
} as const;

export const CATEGORY_LABELS = [
  'news',
  'technology',
  'social media',
  'shopping',
  'entertainment',
  'education',
  'business',
  'health',
  'travel',
  'other',
] as const;

export const DEFAULT_SETTINGS: UserSettings = {
  enabled: true,
  hoverDelay: 500,
  showKeyPoints: true,
  showCategory: true,
  showSentiment: true,
  showReliability: true,
  theme: 'auto',
  language: 'en',
  excludedDomains: [],
  maxCacheAge: 24,
};

export const SUBSCRIPTION_LIMITS = {
  free: {
    previewsPerDay: 25,
    features: ['basic_preview', 'category'] as string[],
  },
  pro: {
    previewsPerDay: 500,
    features: ['basic_preview', 'category', 'sentiment', 'key_points', 'reliability', 'multi_language'] as string[],
  },
  team: {
    previewsPerDay: -1, // unlimited
    features: ['all'] as string[],
  },
} as const;

export const LEMON_SQUEEZY_CONFIG = {
  storeId: 'YOUR_STORE_ID',
  productId: 'YOUR_PRODUCT_ID',
  proVariantId: 'YOUR_PRO_VARIANT_ID',
  teamVariantId: 'YOUR_TEAM_VARIANT_ID',
  checkoutUrl: 'https://your-store.lemonsqueezy.com/checkout/buy/',
} as const;