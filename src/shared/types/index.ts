// src/shared/types/index.ts

export interface LinkPreview {
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
  category: LinkCategory;
  sentiment: Sentiment;
  reliability: number; // 0-100
  language: string;
  timestamp: number;
}

export type LinkCategory = 
  | 'news'
  | 'tech'
  | 'social'
  | 'shopping'
  | 'entertainment'
  | 'education'
  | 'business'
  | 'health'
  | 'travel'
  | 'other';

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface UserSettings {
  enabled: boolean;
  hoverDelay: number; // milliseconds
  showKeyPoints: boolean;
  showCategory: boolean;
  showSentiment: boolean;
  showReliability: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  excludedDomains: string[];
  maxCacheAge: number; // hours
}

export interface UserSubscription {
  tier: 'free' | 'pro' | 'team';
  expiresAt: number | null;
  previewsUsed: number;
  previewsLimit: number;
  lemonSqueezyId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export type MessageType = 
  | 'GET_PREVIEW'
  | 'PREVIEW_RESULT'
  | 'UPDATE_SETTINGS'
  | 'GET_SETTINGS'
  | 'CHECK_SUBSCRIPTION'
  | 'INCREMENT_USAGE';

export interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
}