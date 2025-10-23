# Module 2: Popup UI - Control Panel

## Overview
This module implements a beautiful, user-friendly control panel for the Soma extension. Users can toggle the extension on/off, select their target language, and choose their difficulty level - all with real-time updates to Chrome storage.

## What's Been Built

### 1. **UI Components Library** (`src/components/ui.tsx`)
Professional, accessible components built with TailwindCSS:

#### Switch Component
- Toggle on/off control
- Smooth animations
- Focus states for accessibility
- Disabled state support

#### Select Component
- Dropdown for language selection
- Custom styling with TailwindCSS
- Disabled state handling
- Keyboard navigation support

#### RadioGroup Component
- Visual radio button group
- Selected state with ring highlighting
- Optional descriptions for each option
- Responsive hover states

#### Card, Label, Button Components
- Consistent styling across the UI
- Reusable design system components
- Multiple variants (primary, secondary, outline)

### 2. **Popup Component** (`src/pages/popup/Popup.tsx`)
Fully functional React control panel with:

#### State Management
```typescript
const [settings, setSettings] = useState<SomaUserSettings>({
  isEnabled: true,
  targetLanguage: 'es',
  difficulty: 'beginner',
});
```

#### Lifecycle Management
- `useEffect` loads settings on mount
- Real-time updates to Chrome storage
- Optimistic UI updates for responsiveness
- Error handling with state reversion

#### User Features
- **Master Toggle**: Quick on/off switch in header
- **Language Selector**: 8 languages with flags and native names
- **Difficulty Levels**: Visual radio cards with descriptions
- **Status Banner**: Shows current learning language and difficulty
- **Save Indicator**: Displays last save timestamp
- **Loading State**: Spinner while fetching settings
- **Responsive Design**: 384px width, 500px min height

### 3. **Integration with Module 1**
Perfect integration with storage utilities:

```typescript
// Load settings
const currentSettings = await getUserSettings();

// Update settings
const response = await chrome.runtime.sendMessage({
  type: 'UPDATE_SETTINGS',
  payload: updates,
});

// Helper utilities
getLanguageName(settings.targetLanguage)  // "Spanish"
formatDifficulty(settings.difficulty)      // "Beginner (5%)"
```

## Features Implemented

### ✅ Controlled Components
All form inputs are controlled by React state and synchronized with Chrome storage

### ✅ Real-time Updates
Changes are immediately saved to `chrome.storage.local` via the background worker

### ✅ Message Passing
Uses the `UPDATE_SETTINGS` message type from Module 1

### ✅ Error Handling
Gracefully handles storage errors and reverts UI on failure

### ✅ Loading States
Shows spinner during initial load and saving indicators during updates

### ✅ Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus states
- Screen reader support

### ✅ Visual Design
- Modern gradient background
- Card-based layout
- Smooth transitions
- Professional color scheme
- Flag emojis for visual language identification

## UI Structure

```
┌─────────────────────────────────────┐
│  Header                             │
│  Soma           [Toggle] ON         │
│  Learn languages naturally          │
├─────────────────────────────────────┤
│                                     │
│  [Status Banner]                    │
│  Learning Spanish                   │
│  Beginner (5%)                      │
│                                     │
│  Target Language *                  │
│  [🇪🇸 Spanish (Español)      ▼]    │
│                                     │
│  Difficulty Level *                 │
│  ⦿ Beginner                         │
│    5% of words replaced             │
│  ○ Intermediate                     │
│    15% of words replaced            │
│  ○ Advanced                         │
│    25% of words replaced            │
│                                     │
│  ✓ Saved 10:45:32 AM               │
├─────────────────────────────────────┤
│  v1.0.0                   Refresh   │
└─────────────────────────────────────┘
```

## Component Hierarchy

```
Popup
├── Header
│   ├── Title & Tagline
│   └── Master Toggle Switch
├── Main Content
│   ├── Status Banner (if enabled)
│   ├── Language Selector
│   │   └── Select Component
│   └── Difficulty Selector
│       └── RadioGroup Component
└── Footer
    ├── Version
    └── Refresh Button
```

## How to Use

### From the User's Perspective

1. **Click the extension icon** in Chrome toolbar
2. **Toggle the switch** to enable/disable
3. **Select a language** from the dropdown
4. **Choose difficulty** by clicking a radio option
5. **Changes save automatically** - no "Apply" button needed
6. **Browse any website** - settings apply immediately

### From a Developer's Perspective

The popup uses message passing to communicate with the background worker:

```typescript
// Get current settings
const settings = await getUserSettings();

// Update settings
await chrome.runtime.sendMessage({
  type: 'UPDATE_SETTINGS',
  payload: { difficulty: 'advanced' }
});
```

## Language Support

Currently supported languages:
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇯🇵 Japanese (日本語)
- 🇩🇪 German (Deutsch)
- 🇮🇹 Italian (Italiano)
- 🇵🇹 Portuguese (Português)
- 🇨🇳 Chinese (中文)
- 🇰🇷 Korean (한국어)

## Difficulty Levels

| Level | Percentage | Description |
|-------|-----------|-------------|
| **Beginner** | 5% | Perfect for starting out - minimal disruption |
| **Intermediate** | 15% | Build your vocabulary with moderate immersion |
| **Advanced** | 25% | Challenge yourself with maximum exposure |

## File Structure

```
src/
├── components/
│   └── ui.tsx                      # Reusable UI components
├── pages/
│   └── popup/
│       ├── Popup.tsx              # Main popup component
│       ├── index.tsx              # Entry point
│       ├── index.html             # HTML template
│       └── index.css              # Popup styles
└── utils/
    ├── storage.ts                 # Used by popup
    └── helpers.ts                 # Used by popup
```

## Testing the Popup

### 1. Build the Extension
```bash
npm run build
```

### 2. Load in Chrome
1. Go to `chrome://extensions/`
2. Click reload (🔄) on the Soma extension
3. Click the Soma icon in the toolbar

### 3. Test Features
- ✅ Toggle should enable/disable instantly
- ✅ Language selection should save automatically
- ✅ Difficulty changes should save immediately
- ✅ Status banner should update with selections
- ✅ Timestamp should appear after changes
- ✅ Refresh button should reload current settings

### 4. Verify Storage
Open Service Worker console:
```javascript
chrome.storage.local.get(console.log);
// Should show updated settings
```

## Common Issues & Solutions

### Issue: Popup doesn't open
**Solution**: Check manifest.json has correct popup path
```json
"action": {
  "default_popup": "src/pages/popup/index.html"
}
```

### Issue: Settings don't save
**Solution**: Check background worker is running
- Go to `chrome://extensions/`
- Click "Service worker" link
- Check console for errors

### Issue: UI looks broken
**Solution**: Ensure TailwindCSS is processing correctly
```bash
npm run build
# Check for TailwindCSS output in build logs
```

## Code Examples

### Adding a New Language
```typescript
const languageOptions = [
  // ...existing languages
  { value: 'ru', label: '🇷🇺 Russian (Русский)' },
];
```

### Customizing Difficulty Levels
```typescript
// In src/types.ts
export const DIFFICULTY_TO_PERCENTAGE: Record<DifficultyLevel, number> = {
  beginner: 0.05,
  intermediate: 0.15,
  advanced: 0.30,  // Increased from 0.25
};
```

### Adding a New Setting
```typescript
// 1. Update types (src/types.ts)
export interface SomaUserSettings {
  // ...existing fields
  autoSpeak: boolean;  // New field
}

// 2. Update Popup component
const handleAutoSpeakChange = (checked: boolean) => {
  updateSettings({ autoSpeak: checked });
};

// 3. Add UI control
<Switch
  checked={settings.autoSpeak}
  onCheckedChange={handleAutoSpeakChange}
  label="Auto-pronounce words"
/>
```

## Performance Considerations

### Optimistic Updates
The popup updates local state immediately for a snappy UX, then syncs with Chrome storage:

```typescript
// Update local state first (instant feedback)
const newSettings = { ...settings, ...updates };
setSettings(newSettings);

// Then save to storage (async)
await chrome.runtime.sendMessage({...});
```

### Error Handling
If storage save fails, the UI automatically reverts:

```typescript
} catch (error) {
  console.error('[Soma Popup] Error updating settings:', error);
  // Revert to last known good state
  await loadSettings();
}
```

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators (blue ring on focus)
- ✅ Screen reader support
- ✅ Color contrast meets WCAG AA standards
- ✅ Disabled states clearly indicated

## Next Steps

With Module 2 complete, you can now:
1. **Test the full user flow** - enable extension, select language, choose difficulty
2. **Build Module 3** - Content script to replace words on webpages
3. **Add animations** - Smooth transitions when toggling states
4. **Implement keyboard shortcuts** - Quick enable/disable
5. **Add onboarding** - First-time user guide

## Summary

Module 2 delivers a production-ready popup UI that:
- ✅ Integrates perfectly with Module 1 storage
- ✅ Provides intuitive, accessible controls
- ✅ Auto-saves all changes
- ✅ Handles errors gracefully
- ✅ Looks professional and modern
- ✅ Works seamlessly with Chrome Extension APIs

**Status: COMPLETE** 🎉

All components are tested, styled, and ready for user interaction!
