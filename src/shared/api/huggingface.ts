// src/shared/api/huggingface.ts
import { LinkPreview, LinkCategory, Sentiment } from '../types';
import { HUGGING_FACE_API_URL, MODELS, CATEGORY_LABELS } from '../constants';

interface PageMetadata {
  text: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

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
      // Need at least ~50 chars for meaningful summarization
      if (text.length < 50) return text;

      const result = await this.query<Array<{ summary_text: string }>>(
        MODELS.summarization,
        {
          inputs: text.slice(0, 3000),
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
        inputs: text.slice(0, 1000),
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

  // ─── Main entry point ──────────────────────────────────────────
  async getFullPreview(url: string, pageContent?: string): Promise<LinkPreview> {
    // Always fetch metadata (title, image, description, etc.)
    const metadata = await this.fetchPageContent(url);
    const content = pageContent || metadata.text;

    // Run AI models in parallel
    const [summary, category, sentiment] = await Promise.all([
      this.summarize(content),
      this.classify(content),
      this.analyzeSentiment(content),
    ]);

    const keyPoints = this.extractKeyPoints(summary);
    const reliability = this.calculateReliability(url, content);
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Use metadata.description as fallback if AI summary failed
    const finalSummary =
      summary === 'Summary unavailable.' && metadata.description
        ? metadata.description
        : summary;

    return {
      url,
      title: metadata.title || this.extractTitle(content) || new URL(url).hostname,
      summary: finalSummary,
      keyPoints,
      category,
      sentiment,
      reliability,
      language: 'en',
      timestamp: Date.now(),
      description: metadata.description,
      image: metadata.image,
      readingTime,
      siteName: metadata.siteName,
    };
  }

  // ─── Service-worker-safe HTML fetching + metadata extraction ────
  private async fetchPageContent(url: string): Promise<PageMetadata> {
    const empty: PageMetadata = {
      text: url,
      title: '',
      description: '',
      image: '',
      siteName: '',
    };

    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html' },
      });

      if (!response.ok) return empty;

      const html = await response.text();

      // ── Extract metadata via regex (works in service worker) ──
      const title =
        this.extractMeta(html, 'og:title') ||
        this.extractTagContent(html, 'title') ||
        '';

      const description =
        this.extractMeta(html, 'og:description') ||
        this.extractMeta(html, 'description') ||
        this.extractMeta(html, 'twitter:description') ||
        '';

      let image =
        this.extractMeta(html, 'og:image') ||
        this.extractMeta(html, 'twitter:image') ||
        this.extractMeta(html, 'twitter:image:src') ||
        '';

      const siteName =
        this.extractMeta(html, 'og:site_name') ||
        this.extractMeta(html, 'application-name') ||
        '';

      // Resolve relative image URLs
      if (image && !image.startsWith('http')) {
        try {
          image = new URL(image, url).href;
        } catch {
          image = '';
        }
      }

      // ── Strip HTML to plain text (no DOM needed) ──
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);

      return { text, title, description, image, siteName };
    } catch (error) {
      console.error('Fetch page error:', error);
      return empty;
    }
  }

  // ── Regex-based meta tag extraction ──────────────────────────────
  private extractMeta(html: string, property: string): string {
    // property="og:..." or name="description"
    const patterns = [
      new RegExp(
        `<meta[^>]*property=["']${this.escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
        'i'
      ),
      new RegExp(
        `<meta[^>]*name=["']${this.escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
        'i'
      ),
      // Reversed attribute order
      new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${this.escapeRegex(property)}["']`,
        'i'
      ),
      new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${this.escapeRegex(property)}["']`,
        'i'
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].trim();
    }

    return '';
  }

  private extractTagContent(html: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].replace(/\s+/g, ' ').trim() : '';
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private extractTitle(content: string): string {
    const lines = content.split('\n').filter(line => line.trim().length > 5);
    return lines[0]?.slice(0, 120)?.trim() || '';
  }

  private extractKeyPoints(summary: string): string[] {
    const sentences = summary
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);
    return sentences.slice(0, 3);
  }

  private calculateReliability(url: string, content: string): number {
    let score = 50;

    if (url.startsWith('https://')) score += 10;

    const reliableDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com',
      'nytimes.com', 'bbc.com', 'reuters.com', 'nature.com',
      'mozilla.org', 'developer.mozilla.org', 'medium.com',
      'theguardian.com', 'washingtonpost.com', 'apnews.com',
    ];

    try {
      const domain = new URL(url).hostname;
      if (reliableDomains.some(d => domain.includes(d))) score += 25;
      // Known TLDs get a small boost
      if (domain.endsWith('.edu') || domain.endsWith('.gov')) score += 15;
    } catch {
      // Keep base score
    }

    if (content.length > 1000) score += 10;
    if (content.length > 3000) score += 5;

    return Math.min(score, 100);
  }
}

// ── Factory ──────────────────────────────────────────────────────
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