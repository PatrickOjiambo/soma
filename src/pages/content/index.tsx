/**
 * Soma Extension - Content Script with AI-Powered Word Selection
 * Intelligently selects and replaces words using Chrome AI APIs
 */

import { getUserSettings } from '../../utils/storage';
import { SomaUserSettings } from '../../types';
import {
  extractPageText,
  replaceWordsInDOM,
  removeAllReplacements,
} from '../../utils/dom';
import {
  extractCandidateWords,
  selectWordsWithAI,
  translateWordsWithAI,
} from '../../utils/ai-word-selector';
import './style.css';

console.log('[Soma Content] AI-powered content script loaded');

// State tracking
let isProcessed = false;
let currentSettings: SomaUserSettings | null = null;
let isProcessing = false;

/**
 * Main AI-powered word processing function
 */
async function processPageWithAI(): Promise<void> {
  // Prevent concurrent processing
  if (isProcessing) {
    console.log('[Soma Content] Already processing, skipping...');
    return;
  }

  isProcessing = true;

  try {
    // Get current settings
    const settings = await getUserSettings();
    currentSettings = settings;

    console.log('[Soma Content] Processing page with AI', {
      enabled: settings.isEnabled,
      language: settings.targetLanguage,
      difficulty: settings.difficulty,
    });

    // If disabled, remove existing replacements
    if (!settings.isEnabled) {
      console.log('[Soma Content] Extension disabled, removing replacements');
      if (isProcessed) {
        removeAllReplacements();
        isProcessed = false;
      }
      isProcessing = false;
      return;
    }

    // Remove existing replacements before processing
    if (isProcessed) {
      removeAllReplacements();
    }

    // Step 1: Extract all text from the page
    console.log('[Soma Content] Step 1: Extracting page text...');
    const pageText = extractPageText();
    console.log('[Soma Content] Extracted', pageText.length, 'characters');

    // Step 2: Get candidate words (unique, filtered)
    console.log('[Soma Content] Step 2: Extracting candidate words...');
    const candidateWords = extractCandidateWords(pageText);
    console.log('[Soma Content] Found', candidateWords.length, 'candidate words');

    if (candidateWords.length === 0) {
      console.log('[Soma Content] No candidate words found on page');
      isProcessing = false;
      return;
    }

    // Step 3: Use AI to intelligently select words
    console.log('[Soma Content] Step 3: Using AI to select optimal words...');
    const selectedWords = await selectWordsWithAI(
      candidateWords,
      settings.difficulty,
      settings.targetLanguage
    );
    console.log('[Soma Content] AI selected', selectedWords.length, 'words:', selectedWords);

    if (selectedWords.length === 0) {
      console.log('[Soma Content] No words selected by AI');
      isProcessing = false;
      return;
    }

    // Step 4: Translate selected words with AI
    console.log('[Soma Content] Step 4: Translating words with AI...');
    const translationMap = await translateWordsWithAI(
      selectedWords,
      settings.targetLanguage
    );
    console.log('[Soma Content] Translation map created:', translationMap);

    // Step 5: Replace words in DOM
    console.log('[Soma Content] Step 5: Replacing words in DOM...');
    const replacementCount = replaceWordsInDOM(
      translationMap,
      settings.targetLanguage
    );

    console.log('[Soma Content] ✅ Processing complete!', {
      candidateWords: candidateWords.length,
      selectedByAI: selectedWords.length,
      replaced: replacementCount,
    });

    isProcessed = true;
  } catch (error) {
    console.error('[Soma Content] Error processing page:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Listen for messages from background or popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Soma Content] Message received:', message);

  if (message.type === 'SETTINGS_CHANGED') {
    console.log('[Soma Content] Settings changed, reprocessing page with AI');
    currentSettings = message.payload;

    // Reprocess the page with new settings
    processPageWithAI()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[Soma Content] Error reprocessing:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }

  if (message.type === 'PING') {
    sendResponse({ success: true, message: 'pong', processed: isProcessed });
    return false;
  }

  return false;
});

/**
 * Initialize: Process page when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Soma Content] DOM loaded, initializing...');
    processPageWithAI();
  });
} else {
  // DOM already loaded
  console.log('[Soma Content] DOM already loaded, initializing...');
  processPageWithAI();
}

/**
 * Watch for dynamic content changes (optional - for SPAs)
 * Debounced to avoid excessive processing
 */
let mutationTimeout: NodeJS.Timeout | null = null;
const mutationObserver = new MutationObserver((mutations) => {
  // Only reprocess if extension is enabled and not already processing
  if (!currentSettings?.isEnabled || isProcessing) {
    return;
  }

  // Debounce: wait 2 seconds after last mutation
  if (mutationTimeout) {
    clearTimeout(mutationTimeout);
  }

  mutationTimeout = setTimeout(() => {
    console.log('[Soma Content] DOM mutations detected, reprocessing with AI...');
    processPageWithAI();
  }, 2000); // 2 second debounce for AI processing
});

// Start observing after initial processing
processPageWithAI().then(() => {
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

