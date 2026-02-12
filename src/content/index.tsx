// src/content/index.tsx
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LinkTooltip } from './components/LinkTooltip';
import { UserSettings, LinkPreview } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { isValidUrl, extractDomain } from '@shared/utils/helpers';

import './styles/content.css';

// Debounce utility
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

interface TooltipPosition {
  top: number;
  left: number;
  arrowLeft: number;
  placement: 'top' | 'bottom';
}

class LinkPreviewManager {
  private settings: UserSettings = DEFAULT_SETTINGS;
  private tooltipContainer: HTMLElement | null = null;
  private hoverBridge: HTMLElement | null = null;
  private tooltipRoot: Root | null = null;
  private currentLink: HTMLAnchorElement | null = null;
  private currentUrl: string | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private isTooltipHovered = false;
  private isLinkHovered = false;
  private isExiting = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.createTooltipContainer();
    this.createHoverBridge();
    this.setupEventListeners();
    this.setupKeyboardListeners();
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
    // Remove existing container if present
    const existing = document.getElementById('lp-ai-container');
    if (existing) existing.remove();

    this.tooltipContainer = document.createElement('div');
    this.tooltipContainer.id = 'lp-ai-container';
    this.tooltipContainer.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
    `;
    document.body.appendChild(this.tooltipContainer);
    this.tooltipRoot = createRoot(this.tooltipContainer);
  }

  private createHoverBridge(): void {
    this.hoverBridge = document.createElement('div');
    this.hoverBridge.id = 'lp-ai-bridge';
    this.hoverBridge.style.cssText = `
      position: fixed;
      z-index: 2147483646;
      pointer-events: none;
      background: transparent;
      display: none;
    `;
    document.body.appendChild(this.hoverBridge);

    this.hoverBridge.addEventListener('mouseenter', () => {
      this.clearHideTimeout();
    });

    this.hoverBridge.addEventListener('mouseleave', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget?.closest('#lp-ai-container') && 
          !relatedTarget?.closest('a')) {
        this.scheduleHide();
      }
    });
  }

  private setupEventListeners(): void {
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut);
    document.addEventListener('scroll', this.handleScroll, true);
    window.addEventListener('resize', this.handleResize);
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentUrl) {
        this.hideTooltip();
      }
    });
  }

  private handleMouseOver = debounce((event: unknown): void => {
    const mouseEvent = event as MouseEvent;
    if (!this.settings.enabled) return;

    const target = mouseEvent.target as HTMLElement;
    const link = target.closest('a') as HTMLAnchorElement;

    if (!link || !this.isValidLink(link)) {
      return;
    }

    // If hovering same link, don't restart
    if (this.currentLink === link && this.currentUrl) {
      return;
    }

    this.clearHideTimeout();
    this.isLinkHovered = true;
    this.currentLink = link;

    this.hoverTimeout = setTimeout(() => {
      this.showPreviewForLink(link);
    }, this.settings.hoverDelay);
  }, 50);

  private handleMouseOut = (event: MouseEvent): void => {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const target = event.target as HTMLElement;

    // Check if leaving a link
    if (target.closest('a') === this.currentLink) {
      this.isLinkHovered = false;
    }

    // If moving to tooltip or bridge, don't hide
    if (relatedTarget?.closest('#lp-ai-container') ||
        relatedTarget?.closest('#lp-ai-bridge')) {
      return;
    }

    // If moving to another link, clear timeout but don't hide yet
    if (relatedTarget?.closest('a')) {
      this.clearHoverTimeout();
      return;
    }

    this.clearHoverTimeout();
    this.scheduleHide();
  };

  private handleScroll = (): void => {
    if (this.currentLink && this.currentUrl) {
      // Reposition tooltip on scroll
      const rect = this.currentLink.getBoundingClientRect();
      
      // Hide if link scrolled out of view
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        this.hideTooltip();
      }
    }
  };

  private handleResize = (): void => {
    if (this.currentLink && this.currentUrl) {
      this.hideTooltip();
    }
  };

  private clearHoverTimeout(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private scheduleHide(): void {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      if (!this.isTooltipHovered && !this.isLinkHovered) {
        this.hideTooltip();
      }
    }, 150);
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

    this.currentUrl = url;
    this.isExiting = false;

    const position = this.calculatePosition(rect);
    this.updateHoverBridge(rect, position);

    // Show loading state
    this.renderTooltip({
      url,
      loading: true,
      position,
    });

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PREVIEW',
        payload: url,
      });

      // Check if still showing same URL
      if (this.currentUrl !== url) return;

      if (response.success && response.data) {
        this.renderTooltip({
          url,
          preview: response.data,
          position,
        });
      } else {
        this.renderTooltip({
          url,
          error: response.error || 'Failed to load preview',
          position,
          onRetry: () => this.retryPreview(link),
        });
      }
    } catch (error) {
      if (this.currentUrl !== url) return;

      this.renderTooltip({
        url,
        error: 'Connection error. Please try again.',
        position,
        onRetry: () => this.retryPreview(link),
      });
    }
  }

  private retryPreview(link: HTMLAnchorElement): void {
    this.showPreviewForLink(link);
  }

  private calculatePosition(rect: DOMRect): TooltipPosition {
    const tooltipWidth = 360;
    const tooltipHeight = 380;
    const padding = 12;
    const arrowOffset = 20;

    let placement: 'top' | 'bottom' = 'bottom';
    let top: number;
    let left: number;

    // Calculate horizontal position - center on link
    const linkCenterX = rect.left + rect.width / 2;
    left = linkCenterX - tooltipWidth / 2;

    // Clamp to viewport edges
    const minLeft = padding;
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // Calculate arrow position relative to tooltip
    let arrowLeft = linkCenterX - left;
    // Clamp arrow within tooltip bounds
    arrowLeft = Math.max(arrowOffset, Math.min(arrowLeft, tooltipWidth - arrowOffset));

    // Calculate vertical position
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= tooltipHeight + padding) {
      top = rect.bottom + padding;
      placement = 'bottom';
    } else if (spaceAbove >= tooltipHeight + padding) {
      top = rect.top - tooltipHeight - padding;
      placement = 'top';
    } else {
      // Not enough space - show below and let it scroll
      top = rect.bottom + padding;
      placement = 'bottom';
    }

    return { top, left, arrowLeft, placement };
  }

  private updateHoverBridge(linkRect: DOMRect, position: TooltipPosition): void {
    if (!this.hoverBridge) return;

    const bridgeHeight = Math.abs(
      position.placement === 'bottom'
        ? position.top - linkRect.bottom
        : linkRect.top - (position.top + 380)
    ) + 10;

    this.hoverBridge.style.cssText = `
      position: fixed;
      z-index: 2147483646;
      pointer-events: auto;
      background: transparent;
      display: block;
      left: ${Math.min(linkRect.left, position.left)}px;
      width: ${Math.max(linkRect.width, 360) + 20}px;
      height: ${bridgeHeight}px;
      top: ${position.placement === 'bottom' ? linkRect.bottom : position.top + 380}px;
    `;
  }

  private renderTooltip(props: {
    url: string;
    loading?: boolean;
    preview?: LinkPreview;
    error?: string;
    position: TooltipPosition;
    onRetry?: () => void;
  }): void {
    if (!this.tooltipRoot || !this.tooltipContainer) return;

    this.tooltipContainer.style.pointerEvents = 'auto';

    this.tooltipRoot.render(
      <LinkTooltip
        {...props}
        isExiting={this.isExiting}
        settings={this.settings}
        onMouseEnter={() => {
          this.isTooltipHovered = true;
          this.clearHideTimeout();
        }}
        onMouseLeave={() => {
          this.isTooltipHovered = false;
          this.scheduleHide();
        }}
        onClose={() => this.hideTooltip()}
      />
    );
  }

  private hideTooltip(): void {
    if (!this.currentUrl) return;

    // Trigger exit animation
    this.isExiting = true;

    if (this.tooltipRoot && this.tooltipContainer && this.currentUrl) {
      // Re-render with exit state
      const url = this.currentUrl;
      this.renderTooltip({
        url,
        loading: true, // Will be overridden by exit animation
        position: { top: 0, left: 0, arrowLeft: 180, placement: 'bottom' },
      });
    }

    // Actually remove after animation
    setTimeout(() => {
      if (this.tooltipRoot && this.tooltipContainer) {
        this.tooltipRoot.render(null);
        this.tooltipContainer.style.pointerEvents = 'none';
      }
      if (this.hoverBridge) {
        this.hoverBridge.style.display = 'none';
      }
      this.currentLink = null;
      this.currentUrl = null;
      this.isExiting = false;
    }, 150);
  }

  private handleMessage(
    message: { type: string; payload?: unknown },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void
  ): boolean {
    if (message.type === 'SETTINGS_UPDATED') {
      this.settings = message.payload as UserSettings;
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