// src/shared/utils/helpers.ts
import { LinkCategory, Sentiment } from '../types';

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getCategoryColor(category: LinkCategory): string {
  const colors: Record<LinkCategory, string> = {
    news: 'bg-blue-100 text-blue-800',
    tech: 'bg-purple-100 text-purple-800',
    social: 'bg-pink-100 text-pink-800',
    shopping: 'bg-green-100 text-green-800',
    entertainment: 'bg-yellow-100 text-yellow-800',
    education: 'bg-indigo-100 text-indigo-800',
    business: 'bg-gray-100 text-gray-800',
    health: 'bg-red-100 text-red-800',
    travel: 'bg-teal-100 text-teal-800',
    other: 'bg-slate-100 text-slate-800',
  };
  return colors[category] || colors.other;
}

export function getSentimentColor(sentiment: Sentiment): string {
  const colors: Record<Sentiment, string> = {
    positive: 'text-green-600',
    neutral: 'text-gray-600',
    negative: 'text-red-600',
    mixed: 'text-yellow-600',
  };
  return colors[sentiment];
}

export function getSentimentIcon(sentiment: Sentiment): string {
  const icons: Record<Sentiment, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😟',
    mixed: '🤔',
  };
  return icons[sentiment];
}

export function getReliabilityColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}