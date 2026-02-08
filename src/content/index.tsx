// src/content/index.tsx
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LinkTooltip } from './components/LinkTooltip';
import { UserSettings, LinkPreview } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { isValidUrl, extractDomain } from '@shared/utils/helpers';

// Import CSS - this will be extracted to content.css
import './styles/content.css';

// Custom debounce function with proper typing
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

class LinkPreviewManager {
  private settings: UserSettings = DEFAULT_SETTINGS;
  private tooltipContainer: HTMLElement | null = null;
  private tooltipRoot: Root | null = null;
  private currentLink: HTMLAnchorElement | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private isTooltipHovered = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.createTooltipContainer();
    this.setupEventListeners();
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private async loadSettings(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response) {
        this.settings = response;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private createTooltipContainer(): void {
    this.tooltipContainer = document.createElement('div');
    this.tooltipContainer.id = 'link-preview-ai-container';
    this.tooltipContainer.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
    `;
    document.body.appendChild(this.tooltipContainer);
    this.tooltipRoot = createRoot(this.tooltipContainer);
  }

  private setupEventListeners(): void {
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut.bind(this));
  }

  private handleMouseOver = debounce((event: unknown): void => {
    const mouseEvent = event as MouseEvent;
    if (!this.settings.enabled) return;

    const target = mouseEvent.target as HTMLElement;
    const link = target.closest('a') as HTMLAnchorElement;

    if (!link || !this.isValidLink(link)) {
      return;
    }

    this.currentLink = link;
    
    this.hoverTimeout = setTimeout(() => {
      this.showPreviewForLink(link);
    }, this.settings.hoverDelay);
  }, 100);

  private handleMouseOut(event: MouseEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (relatedTarget?.closest('#link-preview-ai-container')) {
      return;
    }

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    setTimeout(() => {
      if (!this.isTooltipHovered) {
        this.hideTooltip();
      }
    }, 100);
  }

  private isValidLink(link: HTMLAnchorElement): boolean {
    const href = link.href;
    
    if (!href || !isValidUrl(href)) return false;
    
    const domain = extractDomain(href);
    if (this.settings.excludedDomains.includes(domain)) return false;
    
    if (href.startsWith('#') || href.startsWith('javascript:')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    
    return true;
  }

  private async showPreviewForLink(link: HTMLAnchorElement): Promise<void> {
    const rect = link.getBoundingClientRect();
    const url = link.href;

    this.renderTooltip({
      url,
      loading: true,
      position: this.calculatePosition(rect),
    });

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PREVIEW',
        payload: url,
      });

      if (response.success && response.data) {
        this.renderTooltip({
          url,
          preview: response.data,
          position: this.calculatePosition(rect),
        });
      } else {
        this.renderTooltip({
          url,
          error: response.error || 'Failed to load preview',
          position: this.calculatePosition(rect),
        });
      }
    } catch (error) {
      this.renderTooltip({
        url,
        error: 'Failed to load preview',
        position: this.calculatePosition(rect),
      });
    }
  }

  private calculatePosition(rect: DOMRect): { top: number; left: number; position: 'top' | 'bottom' } {
    const tooltipHeight = 300;
    const tooltipWidth = 350;
    const padding = 10;

    let top: number;
    let left: number;
    let position: 'top' | 'bottom' = 'bottom';

    left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    if (rect.bottom + tooltipHeight + padding < window.innerHeight) {
      top = rect.bottom + padding;
      position = 'bottom';
    } else {
      top = rect.top - tooltipHeight - padding;
      position = 'top';
    }

    return { top, left, position };
  }

  private renderTooltip(props: {
    url: string;
    loading?: boolean;
    preview?: LinkPreview;
    error?: string;
    position: { top: number; left: number; position: 'top' | 'bottom' };
  }): void {
    if (!this.tooltipRoot || !this.tooltipContainer) return;

    this.tooltipContainer.style.pointerEvents = 'auto';
    
    this.tooltipRoot.render(
      <LinkTooltip
        {...props}
        settings={this.settings}
        onMouseEnter={() => { this.isTooltipHovered = true; }}
        onMouseLeave={() => {
          this.isTooltipHovered = false;
          this.hideTooltip();
        }}
        onClose={() => this.hideTooltip()}
      />
    );
  }

  private hideTooltip(): void {
    if (this.tooltipRoot && this.tooltipContainer) {
      this.tooltipRoot.render(null);
      this.tooltipContainer.style.pointerEvents = 'none';
    }
    this.currentLink = null;
  }

  private handleMessage(
    message: { type: string; payload?: unknown },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void
  ): boolean {
    if (message.type === 'SETTINGS_UPDATED') {
      this.settings = message.payload as UserSettings;
    }
    
    if (message.type === 'SHOW_PREVIEW' && message.payload) {
      const preview = message.payload as { success: boolean; data?: LinkPreview };
      if (preview.success && preview.data) {
        this.renderTooltip({
          url: preview.data.url,
          preview: preview.data,
          position: { top: 100, left: 100, position: 'bottom' },
        });
      }
    }
    
    return false;
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LinkPreviewManager());
} else {
  new LinkPreviewManager();
}