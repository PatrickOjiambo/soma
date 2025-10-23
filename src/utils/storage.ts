/**
 * Soma Extension - Storage Utilities
 * Chrome storage wrapper functions for managing user settings
 */

import { SomaUserSettings, DEFAULT_SETTINGS } from '../types';

/**
 * Storage key for user settings in chrome.storage.local
 */
const SETTINGS_KEY = 'somaUserSettings';

/**
 * Retrieves user settings from chrome.storage.local
 * 
 * @returns Promise resolving to complete SomaUserSettings object
 *          Returns sensible defaults if no settings exist
 * 
 * @example
 * const settings = await getUserSettings();
 * console.log(settings.targetLanguage); // 'es'
 */
export async function getUserSettings(): Promise<SomaUserSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    
    // If settings exist, merge with defaults to handle any missing fields
    if (result[SETTINGS_KEY]) {
      return {
        ...DEFAULT_SETTINGS,
        ...result[SETTINGS_KEY],
      };
    }
    
    // No settings found, return defaults
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error('[Soma Storage] Error retrieving settings:', error);
    // Return defaults on error
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Updates user settings in chrome.storage.local
 * Merges provided partial settings with existing settings
 * 
 * @param settings - Partial settings object to update
 * @returns Promise that resolves when settings are saved
 * 
 * @example
 * // Update only the target language
 * await setUserSettings({ targetLanguage: 'fr' });
 * 
 * @example
 * // Update multiple fields
 * await setUserSettings({
 *   isEnabled: false,
 *   difficulty: 'advanced'
 * });
 */
export async function setUserSettings(
  settings: Partial<SomaUserSettings>
): Promise<void> {
  try {
    // Get current settings
    const currentSettings = await getUserSettings();
    
    // Merge with new settings
    const updatedSettings: SomaUserSettings = {
      ...currentSettings,
      ...settings,
    };
    
    // Save to storage
    await chrome.storage.local.set({
      [SETTINGS_KEY]: updatedSettings,
    });
    
    console.log('[Soma Storage] Settings updated:', updatedSettings);
  } catch (error) {
    console.error('[Soma Storage] Error saving settings:', error);
    throw error;
  }
}

/**
 * Resets user settings to defaults
 * 
 * @returns Promise that resolves when settings are reset
 */
export async function resetUserSettings(): Promise<void> {
  await setUserSettings(DEFAULT_SETTINGS);
}

/**
 * Clears all extension data from storage
 * Use with caution - this will remove all stored settings
 * 
 * @returns Promise that resolves when storage is cleared
 */
export async function clearAllData(): Promise<void> {
  try {
    await chrome.storage.local.clear();
    console.log('[Soma Storage] All data cleared');
  } catch (error) {
    console.error('[Soma Storage] Error clearing data:', error);
    throw error;
  }
}
