/**
 * Soma Extension - Background Service Worker
 * Handles extension lifecycle, initialization, and message passing
 */

import { setUserSettings, getUserSettings } from '../../utils/storage';
import { DEFAULT_SETTINGS } from '../../types';

console.log('[Soma Background] Service worker loaded');

/**
 * Initialize extension on first install or update
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Soma Background] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First-time installation: set default settings
    try {
      await setUserSettings(DEFAULT_SETTINGS);
      console.log('[Soma Background] Default settings initialized:', DEFAULT_SETTINGS);
    } catch (error) {
      console.error('[Soma Background] Error initializing settings:', error);
    }
  } else if (details.reason === 'update') {
    // Extension updated: ensure all settings fields exist
    try {
      const currentSettings = await getUserSettings();
      console.log('[Soma Background] Extension updated. Current settings:', currentSettings);
      
      // Merge with defaults to add any new fields from updates
      await setUserSettings(currentSettings);
    } catch (error) {
      console.error('[Soma Background] Error updating settings:', error);
    }
  }
});

/**
 * Message passing handler
 * Listens for messages from popup, content scripts, and other extension components
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Soma Background] Message received:', {
    message,
    sender: sender.tab ? `Tab ${sender.tab.id}` : 'Extension',
  });

  // Handle different message types
  switch (message.type) {
    case 'GET_SETTINGS':
      // Request for current settings
      getUserSettings()
        .then((settings) => {
          sendResponse({ success: true, data: settings });
        })
        .catch((error) => {
          console.error('[Soma Background] Error getting settings:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response

    case 'UPDATE_SETTINGS':
      // Request to update settings
      setUserSettings(message.payload)
        .then(() => {
          return getUserSettings();
        })
        .then((updatedSettings) => {
          sendResponse({ success: true, data: updatedSettings });
          
          // Notify all tabs about settings change
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  type: 'SETTINGS_CHANGED',
                  payload: updatedSettings,
                }).catch(() => {
                  // Tab might not have content script injected, ignore errors
                });
              }
            });
          });
        })
        .catch((error) => {
          console.error('[Soma Background] Error updating settings:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response

    case 'PING':
      // Health check
      sendResponse({ success: true, message: 'pong' });
      return false;

    default:
      console.warn('[Soma Background] Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

/**
 * Keep service worker alive (optional, for debugging)
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[Soma Background] Browser started, service worker active');
});
