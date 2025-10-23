/**
 * Soma Extension - Utils Module Exports
 * Centralized exports for easy importing
 */

// Storage utilities
export {
  getUserSettings,
  setUserSettings,
  resetUserSettings,
  clearAllData,
} from './storage';

// Helper utilities
export {
  getReplacementPercentage,
  calculateWordsToReplace,
  formatDifficulty,
  getLanguageName,
  validateSettings,
  getSettingsSummary,
} from './helpers';

// Types
export type {
  SomaUserSettings,
  DifficultyLevel,
} from '../types';

export {
  DEFAULT_SETTINGS,
  DIFFICULTY_TO_PERCENTAGE,
} from '../types';
