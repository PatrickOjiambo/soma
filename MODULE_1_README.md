# Module 1: Core State & Storage Management

## Overview
This module establishes the foundation for the Soma extension's state management system, enabling seamless communication between the popup, content scripts, and background service worker.

## What's Been Built

### 1. **Type Definitions** (`src/types.ts`)
- `SomaUserSettings` interface with three core properties:
  - `isEnabled`: Global on/off toggle for the extension
  - `targetLanguage`: ISO 639-1 language code (e.g., 'es', 'ja', 'fr')
  - `difficulty`: Learning level ('beginner', 'intermediate', 'advanced')
- `DEFAULT_SETTINGS`: Default configuration for new installations
- `DIFFICULTY_TO_PERCENTAGE`: Maps difficulty levels to word replacement percentages:
  - Beginner: 5%
  - Intermediate: 15%
  - Advanced: 25%

### 2. **Storage Utilities** (`src/utils/storage.ts`)
Provides a clean API for Chrome storage operations:

#### `getUserSettings()`
- Retrieves settings from `chrome.storage.local`
- Returns complete settings with defaults for missing fields
- Handles errors gracefully by returning defaults

#### `setUserSettings(settings)`
- Merges partial settings with existing configuration
- Saves to `chrome.storage.local`
- Logs updates for debugging

#### Additional utilities:
- `resetUserSettings()`: Resets to defaults
- `clearAllData()`: Clears all extension data

### 3. **Background Service Worker** (`src/pages/background/index.ts`)
Handles extension lifecycle and inter-component communication:

#### Initialization (`chrome.runtime.onInstalled`)
- **On Install**: Sets default settings for first-time users
- **On Update**: Ensures all settings fields exist after extension updates

#### Message Passing (`chrome.runtime.onMessage`)
Supports three message types:
- `GET_SETTINGS`: Retrieves current user settings
- `UPDATE_SETTINGS`: Updates settings and broadcasts changes to all tabs
- `PING`: Health check endpoint

#### Features:
- Async response handling with proper channel management
- Broadcasts settings changes to all active tabs
- Comprehensive error logging

### 4. **Manifest Configuration** (`manifest.json`)
- Registered background service worker with ES module support
- Added `storage` permission for `chrome.storage.local` access
- Manifest V3 compliant

## How to Use

### From Popup or Options Page
```typescript
import { getUserSettings, setUserSettings } from '../utils/storage';

// Get current settings
const settings = await getUserSettings();
console.log(settings.targetLanguage); // 'es'

// Update settings
await setUserSettings({
  targetLanguage: 'fr',
  difficulty: 'intermediate'
});
```

### From Content Script
```typescript
// Request settings from background
chrome.runtime.sendMessage(
  { type: 'GET_SETTINGS' },
  (response) => {
    if (response.success) {
      console.log('Settings:', response.data);
    }
  }
);

// Update settings
chrome.runtime.sendMessage(
  {
    type: 'UPDATE_SETTINGS',
    payload: { difficulty: 'advanced' }
  },
  (response) => {
    if (response.success) {
      console.log('Updated settings:', response.data);
    }
  }
);

// Listen for settings changes
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_CHANGED') {
    console.log('Settings updated:', message.payload);
    // Re-apply word replacement with new settings
  }
});
```

### Testing the Background Script
```typescript
// Ping test
chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
  console.log(response.message); // 'pong'
});
```

## File Structure
```
src/
├── types.ts                          # Type definitions
├── utils/
│   └── storage.ts                    # Chrome storage utilities
└── pages/
    └── background/
        └── index.ts                  # Background service worker
```

## Next Steps
With this foundation in place, you can now:
1. Build the popup UI to display and modify settings
2. Implement content script that reads settings and applies word replacement
3. Add Firebase authentication and sync settings to Firestore
4. Implement the AI-powered translation and learning features

## Testing
To test this module:
1. Build the extension: `npm run build` or `npm run dev`
2. Load the unpacked extension in Chrome
3. Open Chrome DevTools > Service Workers to view background logs
4. Check storage: `chrome.storage.local.get(console.log)` in any extension context
5. Test message passing from popup or content scripts

## Notes
- All settings are stored locally in `chrome.storage.local`
- Settings persist across browser sessions
- The background service worker automatically initializes on first install
- Settings changes are broadcast to all tabs in real-time
