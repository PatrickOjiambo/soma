/**
 * Soma Extension - Helper Utilities
 * Additional utility functions for the extension
 */

import { DifficultyLevel, DIFFICULTY_TO_PERCENTAGE, SomaUserSettings } from '../types';

/**
 * Get the word replacement percentage for a given difficulty level
 * 
 * @param difficulty - The difficulty level
 * @returns Percentage as a decimal (0.05 for 5%, etc.)
 * 
 * @example
 * const percentage = getReplacementPercentage('beginner'); // 0.05
 */
export function getReplacementPercentage(difficulty: DifficultyLevel): number {
  return DIFFICULTY_TO_PERCENTAGE[difficulty];
}

/**
 * Calculate how many words should be replaced on a page
 * 
 * @param totalWords - Total number of words on the page
 * @param difficulty - Current difficulty level
 * @returns Number of words to replace
 * 
 * @example
 * const wordsToReplace = calculateWordsToReplace(1000, 'intermediate'); // 150
 */
export function calculateWordsToReplace(
  totalWords: number,
  difficulty: DifficultyLevel
): number {
  const percentage = getReplacementPercentage(difficulty);
  return Math.floor(totalWords * percentage);
}

/**
 * Format difficulty level for display
 * 
 * @param difficulty - The difficulty level
 * @returns Formatted string with percentage
 * 
 * @example
 * formatDifficulty('beginner'); // "Beginner (5%)"
 */
export function formatDifficulty(difficulty: DifficultyLevel): string {
  const percentage = Math.round(getReplacementPercentage(difficulty) * 100);
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return `${label} (${percentage}%)`;
}

/**
 * Get language name from ISO code (basic implementation)
 * You can expand this with a complete language mapping
 * 
 * @param code - ISO 639-1 language code
 * @returns Language name
 * 
 * @example
 * getLanguageName('es'); // "Spanish"
 */
export function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    nl: 'Dutch',
    sv: 'Swedish',
    pl: 'Polish',
    tr: 'Turkish',
  };
  
  return languageMap[code] || code.toUpperCase();
}

/**
 * Validate user settings object
 * 
 * @param settings - Settings object to validate
 * @returns True if valid, false otherwise
 */
export function validateSettings(settings: Partial<SomaUserSettings>): boolean {
  if (settings.isEnabled !== undefined && typeof settings.isEnabled !== 'boolean') {
    return false;
  }
  
  if (settings.targetLanguage !== undefined && typeof settings.targetLanguage !== 'string') {
    return false;
  }
  
  if (settings.difficulty !== undefined) {
    const validDifficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(settings.difficulty)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Create a settings summary for logging/display
 * 
 * @param settings - User settings
 * @returns Formatted summary string
 */
export function getSettingsSummary(settings: SomaUserSettings): string {
  return `Soma is ${settings.isEnabled ? 'enabled' : 'disabled'} | ` +
         `Learning ${getLanguageName(settings.targetLanguage)} | ` +
         `${formatDifficulty(settings.difficulty)}`;
}
