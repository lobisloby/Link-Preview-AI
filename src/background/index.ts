// src/background/index.ts
import { Message, LinkPreview, UserSettings, PreviewResponse } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { getHuggingFaceService } from '@shared/api/huggingface';
import { 
  getSettings, 
  saveSettings, 
  getSubscription, 
  getUsageStats,
  checkLimit,
  incrementUsage,
  getCachedPreview,
  setCachedPreview,
} from '@shared/storage';

// Message handler
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Message handler error:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    });
  
  return true; // Keep channel open for async response
});

async function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'GET_PREVIEW':
      return await handleGetPreview(message.payload as string);
    
    case 'GET_SETTINGS':
      return await getSettings();
    
    case 'UPDATE_SETTINGS':
      return await saveSettings(message.payload as Partial<UserSettings>);
    
    case 'CHECK_SUBSCRIPTION':
      return await getSubscription();
    
    case 'GET_STATS':
      return await getUsageStats();
    
    case 'CHECK_LIMIT':
      return await checkLimit();
    
    case 'INCREMENT_USAGE':
      return await incrementUsage();
    
    case 'OPEN_UPGRADE':
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html#upgrade') });
      return { success: true };
    
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

async function handleGetPreview(url: string): Promise<PreviewResponse> {
  try {
    // Check limit first
    const limitCheck = await checkLimit();
    
    if (!limitCheck.canUse) {
      return { 
        success: false, 
        limitReached: true,
        remainingPreviews: 0,
        error: 'Daily preview limit reached',
      };
    }

    // Check cache
    const cached = await getCachedPreview(url);
    if (cached) {
      return { 
        success: true, 
        data: cached as LinkPreview,
        remainingPreviews: limitCheck.remaining,
      };
    }

    // Increment usage before making API call
    const usageResult = await incrementUsage();
    
    if (!usageResult.success) {
      return { 
        success: false, 
        limitReached: true,
        remainingPreviews: 0,
        error: 'Daily preview limit reached',
      };
    }

    // Get preview from AI
    const service = await getHuggingFaceService();
    const preview = await service.getFullPreview(url);

    // Cache the result
    await setCachedPreview(url, preview);

    return { 
      success: true, 
      data: preview,
      remainingPreviews: usageResult.remaining,
      limitReached: usageResult.limitReached,
    };
  } catch (error) {
    console.error('Preview error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Extension installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await saveSettings(DEFAULT_SETTINGS);
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?welcome=true'),
    });
  }
});

// Context menu (optional)
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