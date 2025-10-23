# Soma Extension - Quick Reference Guide

## 📁 Module 1 Files Created

```
src/
├── types.ts                    # Core type definitions
├── utils/
│   ├── storage.ts              # Chrome storage API wrapper
│   ├── helpers.ts              # Utility functions
│   └── storage.test.ts         # Test examples
└── pages/
    └── background/
        └── index.ts            # Background service worker

manifest.json                   # Updated with storage permission
MODULE_1_README.md              # Comprehensive documentation
```

## 🎯 Key Features Implemented

### 1. Type-Safe Settings Management
- `SomaUserSettings` interface with three properties
- Default settings configuration
- Difficulty-to-percentage mapping

### 2. Chrome Storage Integration
- `getUserSettings()` - Retrieve settings with defaults
- `setUserSettings()` - Update settings (partial or full)
- `resetUserSettings()` - Reset to defaults
- `clearAllData()` - Clear all storage

### 3. Background Service Worker
- Auto-initialization on install
- Message passing handlers (GET_SETTINGS, UPDATE_SETTINGS, PING)
- Real-time settings broadcast to all tabs
- Error handling and logging

### 4. Helper Utilities
- `getReplacementPercentage()` - Get word replacement ratio
- `calculateWordsToReplace()` - Calculate words for difficulty
- `formatDifficulty()` - Format for display
- `getLanguageName()` - ISO code to language name
- `validateSettings()` - Settings validation
- `getSettingsSummary()` - Formatted summary

## 🚀 Quick Start

### Import and Use in Your Components

```typescript
// In popup, options, or any extension page
import { getUserSettings, setUserSettings } from '@/utils/storage';
import { formatDifficulty, getLanguageName } from '@/utils/helpers';

// Get current settings
const settings = await getUserSettings();

// Update settings
await setUserSettings({ 
  targetLanguage: 'fr',
  difficulty: 'intermediate' 
});

// Format for display
const difficultyText = formatDifficulty(settings.difficulty); // "Beginner (5%)"
const languageName = getLanguageName(settings.targetLanguage); // "Spanish"
```

### Message Passing from Content Script

```typescript
// Get settings
chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
  if (response.success) {
    const settings = response.data;
    // Use settings...
  }
});

// Update settings
chrome.runtime.sendMessage({
  type: 'UPDATE_SETTINGS',
  payload: { isEnabled: false }
}, (response) => {
  console.log('Updated:', response.data);
});

// Listen for changes
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_CHANGED') {
    console.log('New settings:', message.payload);
    // React to changes...
  }
});
```

## 🧪 Testing

### Load the Extension
```bash
npm run build
# Load dist_chrome in Chrome -> Extensions -> Load unpacked
```

### Test in Console
```javascript
// In any extension page console:
const { getUserSettings } = await import('./utils/storage.js');
const settings = await getUserSettings();
console.log(settings);

// Or use the test suite:
window.testSomaStorage(); // Runs all tests
```

### View Background Logs
1. Go to `chrome://extensions/`
2. Click "Service worker" under your extension
3. View console logs from background script

## 📊 Settings Schema

```typescript
interface SomaUserSettings {
  isEnabled: boolean;           // true/false
  targetLanguage: string;       // 'es', 'fr', 'ja', etc.
  difficulty: DifficultyLevel;  // 'beginner' | 'intermediate' | 'advanced'
}
```

### Defaults
```typescript
{
  isEnabled: true,
  targetLanguage: 'es',
  difficulty: 'beginner'
}
```

## 🎨 Difficulty Levels

| Level | Percentage | Words Replaced (out of 1000) |
|-------|-----------|------------------------------|
| Beginner | 5% | 50 |
| Intermediate | 15% | 150 |
| Advanced | 25% | 250 |

## 📡 Message Types

| Type | Direction | Purpose | Response |
|------|-----------|---------|----------|
| `GET_SETTINGS` | → Background | Get current settings | `{ success: true, data: SomaUserSettings }` |
| `UPDATE_SETTINGS` | → Background | Update settings | `{ success: true, data: SomaUserSettings }` |
| `SETTINGS_CHANGED` | ← Background | Notify tabs of changes | `{ type: 'SETTINGS_CHANGED', payload: SomaUserSettings }` |
| `PING` | → Background | Health check | `{ success: true, message: 'pong' }` |

## 🔍 Debug Commands

```javascript
// In Chrome DevTools console of extension page:

// View current settings
chrome.storage.local.get(console.log);

// Clear all data
chrome.storage.local.clear();

// Set custom settings
chrome.storage.local.set({ somaUserSettings: { 
  isEnabled: true,
  targetLanguage: 'ja',
  difficulty: 'advanced'
}});

// Test message passing
chrome.runtime.sendMessage({ type: 'PING' }, console.log);
```

## ✅ Verification Checklist

- [x] Types defined in `src/types.ts`
- [x] Storage utilities in `src/utils/storage.ts`
- [x] Background worker in `src/pages/background/index.ts`
- [x] Manifest includes `storage` permission
- [x] Background service worker registered
- [x] Build succeeds without errors
- [x] Helper utilities for formatting
- [x] Test file for verification

## 🎯 Next Module Preview

**Module 2** will implement:
- Popup UI to display/modify settings
- React components with TailwindCSS
- Real-time settings updates
- Toggle switches and language selector

---

**Need help?** Check `MODULE_1_README.md` for detailed documentation.
