/**
 * Soma Extension - Content Script with AI-Powered Word Selection
 * Intelligently selects and replaces words using Chrome AI APIs
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Tooltip from './Tooltip';
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

// Inject Tooltip root and mount React Tooltip (listens to custom events)
function mountTooltipRoot() {
  try {
    if (!document.getElementById('soma-tooltip-root')) {
      const container = document.createElement('div');
      container.id = 'soma-tooltip-root';
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(React.createElement(Tooltip));
      console.log('[Soma Content] Tooltip root mounted');
    }
  } catch (e) {
    console.warn('[Soma Content] Could not mount tooltip root', e);
  }
}

mountTooltipRoot();

// Event delegation for soma-word interactions
function handleMouseOver(event: MouseEvent) {
  const el = event.target as HTMLElement | null;
  if (!el) return;
  if (el.tagName.toLowerCase() === 'soma-word') {
    const originalWord = el.getAttribute('data-original') || '';
    const translatedWord = el.textContent || '';
    const rect = el.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;
    window.dispatchEvent(new CustomEvent('soma-tooltip-show', { detail: { originalWord, translatedWord, x, y } }));
  }
}

function handleMouseOut(event: MouseEvent) {
  const el = event.target as HTMLElement | null;
  if (!el) return;
  if (el.tagName.toLowerCase() === 'soma-word') {
    window.dispatchEvent(new CustomEvent('soma-tooltip-hide'));
  }
}
async function getExampleSentense(translateWord: string, contextText: string): Promise<string> {
  try {
    let session;
    const availability = await LanguageModel.availability()
    console.log('[Soma AI] Language model availability:', availability);

    if (availability === 'available') {
      console.log('[Soma AI] Model is available, creating session...');
      session = await LanguageModel.create({
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`[Soma AI] Model download progress: ${Math.round(e.loaded * 100)}%`);
          });
        },
      });
    } else if (availability === 'downloadable') {
      console.log('[Soma AI] Model is downloadable. Checking for user activation...');

      if (navigator.userActivation.isActive) {
        console.log('[Soma AI] User activation detected, creating session (will trigger download)...');
        session = await LanguageModel.create({
          expectedInputs: [{ type: "text", languages: ["en"] }],
          expectedOutputs: [{ type: "text", languages: ["en"] }],
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              console.log(`[Soma AI] Model download progress: ${Math.round(e.loaded * 100)}%`);
            });
          },
        });
        console.log('[Soma AI] Model downloaded and session created.');
      } else {
        console.warn('[Soma AI] Model is downloadable, but user activation is required. Using fallback.');
        return translateWord;
      }
    } else {
      // This covers 'unavailable' and 'downloading'
      console.warn(`[Soma AI] Language model status is '${availability}'. Using fallback.`);
      return translateWord;

    }
    const promptExample = `Provide an example sentence using the word "${translateWord}" in context. Keep it concise and relevant to the following text: "${contextText.substring(0, 200)}" 
                        OUTPUT ONLY the example sentence.`;
    const response = await session?.prompt(promptExample);
    return response || '';
  }
  catch (e) {
    console.warn('[Soma Content] Example generation failed', e);
    return `${translateWord} — example.`;
  }

}

async function handleClick(event: MouseEvent) {
  const el = event.target as HTMLElement | null;
  if (!el) return;
  if (el.tagName.toLowerCase() === 'soma-word') {
    event.preventDefault();
    event.stopPropagation();

    const originalWord = el.getAttribute('data-original') || '';
    const translatedWord = el.textContent || '';
    // Get context: prefer closest paragraph
    const paragraph = el.closest('p') || el.parentElement;
    const contextText = paragraph ? (paragraph.textContent || '') : document.body.textContent || '';

    // Generate example sentence with on-device AI (LanguageModel wrapper)
    let example = '';
    let session;

    try {
      example = await getExampleSentense(translatedWord, contextText);
    } catch (e) {
      console.warn('[Soma Content] Example generation failed', e);
      example = `${translatedWord} — example.`;
    }
    // Dispatch expand event to show expanded tooltip with AI sentence
    const rect = el.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent('soma-tooltip-expand', { detail: { contextSentence: example, x: rect.left, y: rect.top } }));

    // Pronounce using Web Speech API
    try {
      const utter = new SpeechSynthesisUtterance(translatedWord || '');
      utter.lang = currentSettings?.targetLanguage || 'en-US';
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('[Soma Content] Speech synthesis failed', e);
    }

    // Trigger logging: send message to background (Module 5 will handle persistence)
    try {
      chrome.runtime.sendMessage({ type: 'LOG_WORD', payload: { originalWord, translatedWord } });
    } catch (e) {
      console.warn('[Soma Content] Could not send log message', e);
    }
  }
}

// Attach delegated listeners
document.addEventListener('mouseover', handleMouseOver);
document.addEventListener('mouseout', handleMouseOut);
document.addEventListener('click', handleClick, true);

// State tracking
let isProcessed = false;
let currentSettings: SomaUserSettings | null = null;
let isProcessing = false;

/**
 * Main AI-powered word processing function
 */
async function processPageWithAI(force: boolean = false): Promise<void> {
  // Prevent concurrent processing
  if (isProcessing) {
    console.log('[Soma Content] Already processing, skipping...');
    return;
  }

  // If we've already successfully processed the page and caller didn't force, skip
  if (isProcessed && !force) {
    console.log('[Soma Content] Page already processed, skipping repeated run');
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

    // Reprocess the page with new settings (force a re-run)
    processPageWithAI(true)
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
  // If we've already processed successfully, don't auto-reprocess (avoids loops from our own DOM edits)
  if (isProcessed) return;

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

// Prevent the mutation observer from re-running processing if we've already done it
// (This avoids the AI workflow being triggered repeatedly due to DOM changes created by replacements)
mutationObserver.disconnect();
processPageWithAI().then(() => {
  // Re-attach observer only if extension remains enabled
  if (currentSettings?.isEnabled) {
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
});

