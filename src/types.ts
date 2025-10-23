/**
 * Soma Extension - Type Definitions
 * Core types for the language learning extension
 */

/**
 * Difficulty levels that map to word replacement percentages:
 * - beginner: 5% of words replaced
 * - intermediate: 15% of words replaced
 * - advanced: 25% of words replaced
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * User settings interface for the Soma extension
 * These settings are stored in chrome.storage.local and shared across
 * popup, content scripts, and background service worker
 */
export interface SomaUserSettings {
  /**
   * Global on/off toggle for the extension
   */
  isEnabled: boolean;

  /**
   * Target language code (ISO 639-1 format)
   * Examples: 'es' (Spanish), 'ja' (Japanese), 'fr' (French)
   */
  targetLanguage: string;

  /**
   * Learning difficulty level
   * Determines the percentage of words to replace on webpages
   */
  difficulty: DifficultyLevel;
}

/**
 * Default settings for new installations
 */
export const DEFAULT_SETTINGS: SomaUserSettings = {
  isEnabled: true,
  targetLanguage: 'es', // Spanish as default
  difficulty: 'beginner',
};

/**
 * Mapping of difficulty levels to word replacement percentages
 */
export const DIFFICULTY_TO_PERCENTAGE: Record<DifficultyLevel, number> = {
  beginner: 0.05,     // 5%
  intermediate: 0.15, // 15%
  advanced: 0.25,     // 25%
};
