// src/shared/api/huggingface.ts
import { LinkPreview, LinkCategory, Sentiment } from '../types';
import { HUGGING_FACE_API_URL, MODELS, CATEGORY_LABELS } from '../constants';

export class HuggingFaceService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async query<T>(
    model: string,
    inputs: string | { inputs: string; parameters?: Record<string, unknown> }
  ): Promise<T> {
    const response = await fetch(`${HUGGING_FACE_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeof inputs === 'string' ? { inputs } : inputs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    return response.json();
  }

  async summarize(text: string): Promise<string> {
    try {
      const result = await this.query<Array<{ summary_text: string }>>(
        MODELS.summarization,
        {
          inputs: text,
          parameters: {
            max_length: 150,
            min_length: 30,
            do_sample: false,
          },
        }
      );
      return result[0]?.summary_text || 'Unable to generate summary.';
    } catch (error) {
      console.error('Summarization error:', error);
      return 'Summary unavailable.';
    }
  }

  async classify(text: string): Promise<LinkCategory> {
    try {
      const result = await this.query<{
        labels: string[];
        scores: number[];
      }>(MODELS.classification, {
        inputs: text,
        parameters: {
          candidate_labels: CATEGORY_LABELS,
        },
      });

      const topLabel = result.labels[0]?.toLowerCase() || 'other';
      return this.mapToCategory(topLabel);
    } catch (error) {
      console.error('Classification error:', error);
      return 'other';
    }
  }

  async analyzeSentiment(text: string): Promise<Sentiment> {
    try {
      const result = await this.query<Array<Array<{ label: string; score: number }>>>(
        MODELS.sentiment,
        text.slice(0, 500)
      );

      const topResult = result[0]?.[0];
      if (!topResult) return 'neutral';

      const label = topResult.label.toLowerCase();
      if (label.includes('positive')) return 'positive';
      if (label.includes('negative')) return 'negative';
      return 'neutral';
    } catch (error) {
      console.error('Sentiment error:', error);
      return 'neutral';
    }
  }

  private mapToCategory(label: string): LinkCategory {
    const mapping: Record<string, LinkCategory> = {
      'news': 'news',
      'technology': 'tech',
      'tech': 'tech',
      'social media': 'social',
      'social': 'social',
      'shopping': 'shopping',
      'e-commerce': 'shopping',
      'entertainment': 'entertainment',
      'education': 'education',
      'academic': 'education',
      'business': 'business',
      'finance': 'business',
      'health': 'health',
      'medical': 'health',
      'travel': 'travel',
      'tourism': 'travel',
    };
    return mapping[label] || 'other';
  }

  async getFullPreview(url: string, pageContent?: string): Promise<LinkPreview> {
    const content = pageContent || await this.fetchPageContent(url);
    
    const [summary, category, sentiment] = await Promise.all([
      this.summarize(content),
      this.classify(content),
      this.analyzeSentiment(content),
    ]);

    // Extract key points from summary
    const keyPoints = this.extractKeyPoints(summary);
    
    // Calculate reliability score based on various factors
    const reliability = this.calculateReliability(url, content);

    return {
      url,
      title: this.extractTitle(content) || url,
      summary,
      keyPoints,
      category,
      sentiment,
      reliability,
      language: 'en',
      timestamp: Date.now(),
    };
  }

  private async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic HTML to text extraction
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove script and style elements
      const scripts = tempDiv.querySelectorAll('script, style, nav, footer, header');
      scripts.forEach(el => el.remove());
      
      return tempDiv.textContent?.slice(0, 5000) || '';
    } catch {
      return url;
    }
  }

  private extractTitle(content: string): string {
    // Try to extract title from content
    const lines = content.split('\n').filter(line => line.trim());
    return lines[0]?.slice(0, 100) || '';
  }

  private extractKeyPoints(summary: string): string[] {
    // Split summary into sentences and return top 3
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private calculateReliability(url: string, content: string): number {
    let score = 50; // Base score

    // Check for HTTPS
    if (url.startsWith('https://')) score += 10;

    // Check for known reliable domains
    const reliableDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com',
      'nytimes.com', 'bbc.com', 'reuters.com', 'nature.com',
    ];
    
    try {
      const domain = new URL(url).hostname;
      if (reliableDomains.some(d => domain.includes(d))) {
        score += 25;
      }
    } catch {
      // Invalid URL, keep base score
    }

    // Content length factor
    if (content.length > 1000) score += 10;
    if (content.length > 5000) score += 5;

    return Math.min(score, 100);
  }
}

// Factory function for creating service instance
let serviceInstance: HuggingFaceService | null = null;

export async function getHuggingFaceService(): Promise<HuggingFaceService> {
  if (!serviceInstance) {
    const result = await chrome.storage.local.get('hf_api_key');
    const apiKey = (result.hf_api_key as string) || '';
    serviceInstance = new HuggingFaceService(apiKey);
  }
  return serviceInstance;
}

export function resetHuggingFaceService(): void {
  serviceInstance = null;
}