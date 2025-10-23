# 🎉 Module 1 Complete - Testing Guide

## ✅ What Was Built

You now have a fully functional Chrome Extension foundation with:
- ✅ Type-safe settings management
- ✅ Chrome storage integration
- ✅ Background service worker
- ✅ Message passing system
- ✅ Helper utilities
- ✅ Complete documentation

## 🚀 How to Test Right Now

### Step 1: Load the Extension

```bash
# Build is already complete! Extension is in dist_chrome/
cd /home/patrick-ojiambo/Documents/hackathons/soma
```

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist_chrome` folder from your project
6. You should see "Soma" extension loaded!

### Step 2: Test Background Service Worker

1. In `chrome://extensions/`, find your **Soma** extension
2. Look for **"Service worker"** text (it's a blue clickable link under "Inspect views")
3. Click on **"Service worker"** link
4. This opens the background script console in a **new DevTools window**
5. You should see these logs:
   ```
   [Soma Background] Service worker loaded
   [Soma Background] Extension installed/updated: install
   [Soma Background] Default settings initialized: {isEnabled: true, targetLanguage: 'es', difficulty: 'beginner'}
   ```

**⚠️ IMPORTANT:** 
- If you see "inactive" instead of "Service worker", click the 🔄 refresh button on your extension first
- The Service Worker console is a **separate window** from regular webpage DevTools
- You must run ALL tests in this Service Worker console window

### Step 3: Verify Storage

In the Service Worker console, run:

```javascript
// Check if settings were saved
chrome.storage.local.get(console.log);

// Expected output:
// {somaUserSettings: {isEnabled: true, targetLanguage: 'es', difficulty: 'beginner'}}
```

### Step 4: Test Message Passing

In the same Service Worker console:

```javascript
// Test 1: Ping
chrome.runtime.sendMessage({ type: 'PING' }, console.log);
// Expected: {success: true, message: 'pong'}

// Test 2: Get Settings
chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, console.log);
// Expected: {success: true, data: {isEnabled: true, targetLanguage: 'es', difficulty: 'beginner'}}

// Test 3: Update Settings
chrome.runtime.sendMessage({
  type: 'UPDATE_SETTINGS',
  payload: { difficulty: 'advanced', targetLanguage: 'fr' }
}, console.log);
// Expected: {success: true, data: {isEnabled: true, targetLanguage: 'fr', difficulty: 'advanced'}}

// Test 4: Verify Update
chrome.storage.local.get(console.log);
// Should show updated settings
```

### Step 5: Test Storage Functions (Advanced)

If you want to test the actual TypeScript functions, you can:

1. Open popup.html (click the extension icon)
2. Right-click and select **Inspect**
3. In the console, import and test:

```javascript
// This won't work directly because modules aren't exposed
// But we can test via messages (see Step 4)
```

## 📊 What You Should See

### ✅ Checklist After Testing

- [ ] Extension loads without errors
- [ ] Service worker shows initialization logs
- [ ] Storage contains default settings
- [ ] PING message returns 'pong'
- [ ] GET_SETTINGS returns settings object
- [ ] UPDATE_SETTINGS modifies storage
- [ ] Settings persist after browser restart

## 🐛 Troubleshooting

### ❌ Error: "Could not establish connection. Receiving end does not exist"

**This is the most common error!** It means you're testing from the wrong place or the service worker isn't loaded.

**Solution:**
1. **Go to** `chrome://extensions/`
2. **Find** the Soma extension
3. **Click** the "Service worker" link (it will be blue and clickable)
4. **Run your tests** in the Service Worker console that opens (not a regular webpage console!)

**Important:** You MUST test from the Service Worker console, NOT from:
- ❌ Regular webpage console (F12 on any site)
- ❌ Chrome DevTools on a random page
- ❌ Your VS Code terminal

**If "Service worker" says "inactive":**
1. Click the refresh icon 🔄 on your extension card in `chrome://extensions/`
2. Wait a moment for it to load
3. Click "Service worker" again
4. You should see the console logs: `[Soma Background] Service worker loaded`

### Extension won't load
- Check `dist_chrome/manifest.json` exists
- Verify manifest.json has no syntax errors
- Look for errors in `chrome://extensions/` page
- **Reload the extension** after every build (click 🔄 button)

### Service worker shows errors
- Check the Service Worker console for specific errors
- Verify `chrome.storage` permission is in manifest
- Make sure you're using Chrome (not Firefox)
- If service worker is "inactive", click refresh on the extension

### Settings not persisting
- Check `chrome.storage.local.get(console.log)` output
- Clear storage and reload: `chrome.storage.local.clear()`
- Reload the extension (🔄 button in chrome://extensions/)

### Message passing fails
- **CRITICAL**: Are you in the Service Worker console? (See first troubleshooting section above)
- Ensure service worker is active (not stopped or inactive)
- Check for console errors in Service Worker
- Verify message type spelling
- Reload extension if you just rebuilt it

## 🔍 Step-by-Step Diagnostic (If Tests Fail)

If you get "Could not establish connection" error, follow these steps **exactly**:

### Step 1: Verify Extension is Loaded
```
1. Go to: chrome://extensions/
2. Find "Soma" in the list
3. Make sure the toggle is ON (blue)
4. Note: If you don't see it, go back to "How to Test" Step 1
```

### Step 2: Rebuild and Reload (If you made changes)
```bash
# In your terminal:
npm run build

# Then in Chrome:
# 1. Go to chrome://extensions/
# 2. Click the 🔄 (reload) button on the Soma extension card
# 3. Wait 2-3 seconds
```

### Step 3: Open the CORRECT Console
```
1. In chrome://extensions/, under the Soma extension
2. Look for "Inspect views" section
3. Click the blue "Service worker" link
4. A NEW DevTools window opens - this is the Service Worker console
5. Verify you see: [Soma Background] Service worker loaded
```

### Step 4: Test in the Service Worker Console
```javascript
// Copy-paste this ENTIRE block into the Service Worker console:
console.log('Testing from:', chrome.runtime.id);
chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
  console.log('Response:', response);
});

// Expected output:
// Testing from: <your-extension-id>
// Response: {success: true, message: 'pong'}
```

### Step 5: If Still Failing
```javascript
// Check if message listener is registered:
console.log('Runtime:', chrome.runtime);
console.log('Has onMessage:', !!chrome.runtime.onMessage);

// Check storage permission:
chrome.storage.local.get(console.log);

// If this works, the extension is loaded correctly
```

## 🎯 Quick Verification Script

**IMPORTANT: Run this in the Service Worker console ONLY** (see Step 3 above)

Run this complete test in the Service Worker console:

```javascript
async function testModule1() {
  console.log('🧪 Testing Module 1...\n');
  
  // Test 1: Ping
  const ping = await chrome.runtime.sendMessage({ type: 'PING' });
  console.log('✓ Ping:', ping.message === 'pong' ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: Get Settings
  const get = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
  console.log('✓ Get Settings:', get.success ? '✅ PASS' : '❌ FAIL');
  console.log('  Current settings:', get.data);
  
  // Test 3: Update Settings
  const update = await chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    payload: { difficulty: 'intermediate' }
  });
  console.log('✓ Update Settings:', update.success ? '✅ PASS' : '❌ FAIL');
  console.log('  Updated settings:', update.data);
  
  // Test 4: Verify Storage
  const storage = await chrome.storage.local.get('somaUserSettings');
  console.log('✓ Storage Persistence:', storage.somaUserSettings ? '✅ PASS' : '❌ FAIL');
  console.log('  Stored settings:', storage.somaUserSettings);
  
  console.log('\n🎉 Module 1 Testing Complete!');
}

testModule1();
```

## 📁 Files to Review

Check these files to understand the implementation:

1. **`src/types.ts`** - See the type definitions
2. **`src/utils/storage.ts`** - Storage utilities
3. **`src/pages/background/index.ts`** - Background worker
4. **`manifest.json`** - Extension configuration
5. **`MODULE_1_README.md`** - Detailed documentation

## 🎓 What You Learned

By completing Module 1, you now understand:
- ✅ Chrome Extension Manifest V3 structure
- ✅ `chrome.storage.local` API
- ✅ Background service workers
- ✅ Message passing between components
- ✅ TypeScript in Chrome Extensions
- ✅ Async/await patterns
- ✅ Extension lifecycle events

## 🚀 Next Steps

Module 1 is **COMPLETE**! Ready for Module 2:

**Module 2: Popup UI**
- Build React components
- Create settings form
- Add toggles and dropdowns
- Style with TailwindCSS
- Connect to storage utilities

---

## 💡 Pro Tips

1. **Keep Service Worker Console Open**: It's your best debugging tool
2. **Use `console.log`**: Background worker logs are very helpful
3. **Test After Each Change**: Build and reload extension frequently
4. **Check Storage Often**: `chrome.storage.local.get(console.log)`
5. **Clear Storage When Needed**: `chrome.storage.local.clear()`

---

**Happy Coding! 🎉**

Built with ❤️ using React, TypeScript, and Chrome Extension APIs
