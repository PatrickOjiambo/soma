/**
 * Soma Extension - Popup Component
 * Control panel for managing extension settings
 */

import React, { useState, useEffect } from 'react';
import { getUserSettings, setUserSettings } from '../../utils/storage';
import { SomaUserSettings, DifficultyLevel } from '../../types';
import { getLanguageName, formatDifficulty } from '../../utils/helpers';
import { Switch, Select, RadioGroup, Label, Button, Card } from '../../components/ui';

function Popup() {
  // State management - holds current settings
  const [settings, setSettings] = useState<SomaUserSettings>({
    isEnabled: true,
    targetLanguage: 'es',
    difficulty: 'beginner',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings from chrome.storage.local
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = await getUserSettings();
      setSettings(currentSettings);
      console.log('[Soma Popup] Settings loaded:', currentSettings);
    } catch (error) {
      console.error('[Soma Popup] Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings in both local state and chrome.storage
  const updateSettings = async (updates: Partial<SomaUserSettings>) => {
    try {
      setIsSaving(true);
      
      // Update local state immediately for responsive UI
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      
      // Save to chrome.storage.local via background script
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        payload: updates,
      });
      
      if (response.success) {
        setLastSaved(new Date());
        console.log('[Soma Popup] Settings saved:', response.data);
      } else {
        console.error('[Soma Popup] Failed to save settings:', response.error);
        // Revert on error
        await loadSettings();
      }
    } catch (error) {
      console.error('[Soma Popup] Error updating settings:', error);
      // Revert on error
      await loadSettings();
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for toggle switch
  const handleToggle = (checked: boolean) => {
    updateSettings({ isEnabled: checked });
  };

  // Handler for language selection
  const handleLanguageChange = (language: string) => {
    updateSettings({ targetLanguage: language });
  };

  // Handler for difficulty selection
  const handleDifficultyChange = (difficulty: string) => {
    updateSettings({ difficulty: difficulty as DifficultyLevel });
  };

  // Language options
  const languageOptions = [
    { value: 'es', label: '🇪🇸 Spanish (Español)' },
    { value: 'fr', label: '🇫🇷 French (Français)' },
    { value: 'ja', label: '🇯🇵 Japanese (日本語)' },
    { value: 'de', label: '🇩🇪 German (Deutsch)' },
    { value: 'it', label: '🇮🇹 Italian (Italiano)' },
    { value: 'pt', label: '🇵🇹 Portuguese (Português)' },
    { value: 'zh', label: '🇨🇳 Chinese (中文)' },
    { value: 'ko', label: '🇰🇷 Korean (한국어)' },
  ];

  // Difficulty options
  const difficultyOptions = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: '5% of words replaced - Perfect for starting out',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: '15% of words replaced - Build your vocabulary',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: '25% of words replaced - Challenge yourself',
    },
  ];

  if (isLoading) {
    return (
      <div className="w-96 h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 min-h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-2 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soma</h1>
            <p className="text-xs text-gray-500 mt-0.5">Learn languages naturally</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={handleToggle}
              id="master-toggle"
              label="Enable Soma"
            />
            <span className="text-sm font-medium text-gray-700">
              {settings.isEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Status Banner */}
        {settings.isEnabled && (
          <Card className="bg-blue-50 border-blue-200 p-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Learning {getLanguageName(settings.targetLanguage)}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {formatDifficulty(settings.difficulty)} • Browse any page to start learning
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select" required>
            Target Language
          </Label>
          <Select
            id="language-select"
            value={settings.targetLanguage}
            onValueChange={handleLanguageChange}
            options={languageOptions}
            disabled={!settings.isEnabled || isSaving}
          />
          <p className="text-xs text-gray-500">
            Choose the language you want to learn
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <Label required>
            Difficulty Level
          </Label>
          <RadioGroup
            name="difficulty"
            value={settings.difficulty}
            onValueChange={handleDifficultyChange}
            options={difficultyOptions}
            disabled={!settings.isEnabled || isSaving}
          />
        </div>

        {/* Save Status */}
        {lastSaved && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-2 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>v1.0.0</span>
          <button
            onClick={loadSettings}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Refresh'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Popup;