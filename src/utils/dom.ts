/**
 * Soma Extension - DOM Utilities
 * Functions for DOM traversal, text extraction, and word replacement
 */

// Tags to exclude from text processing
const EXCLUDED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'BUTTON',
  'CODE',
  'PRE',
  'SVG',
  'CANVAS',
  'SOMA-WORD',
]);

/**
 * Get all text nodes from the document
 */
export function getAllTextNodes(rootElement: HTMLElement = document.body): Text[] {
  const textNodes: Text[] = [];

  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent || EXCLUDED_TAGS.has(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (parent.isContentEditable) {
          return NodeFilter.FILTER_REJECT;
        }

        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.textContent || '';
        if (!text.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode as Text);
  }

  return textNodes;
}

/**
 * Extract all text content from the page
 */
export function extractPageText(rootElement: HTMLElement = document.body): string {
  const textNodes = getAllTextNodes(rootElement);
  return textNodes.map((node) => node.textContent || '').join(' ');
}

/**
 * Replace a word in a text node with a soma-word element
 */
export function replaceWordInTextNode(
  textNode: Text,
  word: string,
  translation: string,
  targetLanguage: string
): void {
  const text = textNode.textContent || '';
  const parent = textNode.parentNode;

  if (!parent) return;

  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  const match = text.match(regex);

  if (!match || match.index === undefined) return;

  const matchedWord = match[0];
  const startIndex = match.index;
  const endIndex = startIndex + matchedWord.length;

  const beforeText = text.substring(0, startIndex);
  const afterText = text.substring(endIndex);

  const fragment = document.createDocumentFragment();

  if (beforeText) {
    fragment.appendChild(document.createTextNode(beforeText));
  }

  const somaWord = document.createElement('soma-word');
  somaWord.textContent = translation;
  somaWord.setAttribute('data-original', matchedWord);
  somaWord.setAttribute('data-translation', translation);
  somaWord.setAttribute('data-language', targetLanguage);
  fragment.appendChild(somaWord);

  if (afterText) {
    fragment.appendChild(document.createTextNode(afterText));
  }

  parent.replaceChild(fragment, textNode);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace all occurrences of words in the DOM
 */
export function replaceWordsInDOM(
  translationMap: Record<string, string>,
  targetLanguage: string,
  rootElement: HTMLElement = document.body
): number {
  console.log('[Soma DOM] Starting word replacement...', {
    wordsToReplace: Object.keys(translationMap).length,
  });

  let replacementCount = 0;
  const words = Object.keys(translationMap);

  words.forEach((word) => {
    const translation = translationMap[word];
    const textNodes = getAllTextNodes(rootElement);

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');

      if (regex.test(text)) {
        try {
          replaceWordInTextNode(textNode, word, translation, targetLanguage);
          replacementCount++;
        } catch (error) {
          console.error('[Soma DOM] Error replacing word:', error);
        }
      }
    });
  });

  console.log('[Soma DOM] Replacement complete:', replacementCount, 'words replaced');
  return replacementCount;
}

/**
 * Remove all soma-word elements and restore original text
 */
export function removeAllReplacements(rootElement: HTMLElement = document.body): void {
  const somaWords = rootElement.querySelectorAll('soma-word');

  somaWords.forEach((element) => {
    const originalWord = element.getAttribute('data-original');
    if (originalWord && element.parentNode) {
      const textNode = document.createTextNode(originalWord);
      element.parentNode.replaceChild(textNode, element);
    }
  });

  console.log('[Soma DOM] Removed', somaWords.length, 'replacements');
}
