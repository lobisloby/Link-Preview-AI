// src/background/index.ts
import { Message, LinkPreview, UserSettings } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { getHuggingFaceService } from '@shared/api/huggingface';
import { lemonSqueezyService } from '@shared/api/lemonSqueezy';
import { PreviewCache } from '@shared/utils/cache';

const cache = PreviewCache.getInstance();

interface SettingsStorage {
  settings?: UserSettings;
}

// ─── Message router ────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Message handler error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

  return true; // async
});

async function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'GET_PREVIEW':
      return await handleGetPreview(message.payload as string);

    case 'GET_SETTINGS':
      return await handleGetSettings();

    case 'UPDATE_SETTINGS':
      return await handleUpdateSettings(message.payload as Partial<UserSettings>);

    case 'CHECK_SUBSCRIPTION':
      return await lemonSqueezyService.getDefaultSubscription();

    case 'INCREMENT_USAGE':
      return await lemonSqueezyService.incrementUsage();

    // ── NEW ─────────────────────────────────────────────────────
    case 'ACTIVATE_LICENSE':
      return await lemonSqueezyService.activateLicense(message.payload as string);

    case 'DEACTIVATE_LICENSE':
      return await lemonSqueezyService.deactivateLicense();
    // ────────────────────────────────────────────────────────────

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// ─── Handlers (unchanged) ──────────────────────────────────────────
async function handleGetPreview(
  url: string
): Promise<{ success: boolean; data?: LinkPreview; error?: string }> {
  try {
    const cached = await cache.get(url);
    if (cached) return { success: true, data: cached };

    const canUse = await lemonSqueezyService.incrementUsage();
    if (!canUse) {
      return {
        success: false,
        error: 'Daily preview limit reached. Upgrade for more previews!',
      };
    }

    const service = await getHuggingFaceService();
    const preview = await service.getFullPreview(url);
    await cache.set(url, preview);

    return { success: true, data: preview };
  } catch (error) {
    console.error('Preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleGetSettings(): Promise<UserSettings> {
  const result: SettingsStorage = await chrome.storage.sync.get('settings');
  if (result.settings) return { ...DEFAULT_SETTINGS, ...result.settings };
  return DEFAULT_SETTINGS;
}

async function handleUpdateSettings(
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const current = await handleGetSettings();
  const newSettings: UserSettings = { ...current, ...updates };
  await chrome.storage.sync.set({ settings: newSettings });
  return newSettings;
}

// ─── Install handler (unchanged) ──────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?welcome=true'),
    });
  }
});

// ─── Context menu (unchanged) ─────────────────────────────────────
try {
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'preview-link',
      title: 'Preview with Link Preview AI',
      contexts: ['link'],
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'preview-link' && info.linkUrl && tab?.id) {
        const preview = await handleGetPreview(info.linkUrl);
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_PREVIEW',
          payload: preview,
        });
      }
    });
  }
} catch (e) {
  console.log('Context menus not available');
}