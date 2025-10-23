# 🚨 Quick Fix: "Could not establish connection" Error

## The Problem
You're getting: `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.`

## The Solution (99% of cases)

### ✅ You're testing from the WRONG console!

You need to test from the **Service Worker console**, not a regular webpage console.

## Step-by-Step Fix:

### 1️⃣ Open Chrome Extensions Page
```
Type in address bar: chrome://extensions/
Press Enter
```

### 2️⃣ Find Your Extension
```
Look for: "Soma"
Make sure the toggle is ON (blue)
```

### 3️⃣ Reload the Extension (IMPORTANT!)
```
Click the 🔄 circular arrow button on the extension card
Wait 2-3 seconds
```

### 4️⃣ Open Service Worker Console
```
Under "Inspect views", click the blue "Service worker" link
A NEW DevTools window will open
This is where you run your tests!
```

### 5️⃣ Verify It's Working
```javascript
// You should see this log automatically:
[Soma Background] Service worker loaded
[Soma Background] Extension installed/updated: install
[Soma Background] Default settings initialized: {...}
```

### 6️⃣ Run Your Test
```javascript
// Now this will work:
chrome.runtime.sendMessage({ type: 'PING' }, console.log);
// Output: {success: true, message: 'pong'}
```

---

## Still Not Working?

### Check 1: Is the Service Worker Active?
- In `chrome://extensions/`, look at your extension
- If it says "inactive" instead of "Service worker", click the 🔄 reload button

### Check 2: Did You Rebuild After Changes?
```bash
# In terminal:
npm run build

# Then reload extension in Chrome (🔄 button)
```

### Check 3: Are You Using Chrome?
- This is a Chrome Extension (won't work in Firefox, Safari, etc.)
- Make sure you're testing in Google Chrome

### Check 4: Check for Build Errors
```bash
npm run build

# Look for any errors in the output
# All should end with: ✓ built in X.XXs
```

---

## Common Mistakes ❌

### ❌ Testing from Regular Webpage Console
```
Opening DevTools (F12) on any webpage
This won't work! You need the Service Worker console
```

### ❌ Not Reloading After Rebuild
```
After running npm run build, you MUST click 🔄 in chrome://extensions/
```

### ❌ Testing Before Service Worker Loads
```
Wait for the logs to appear in the Service Worker console first
```

---

## Visual Guide

```
1. chrome://extensions/
   ↓
2. Find "Soma" extension
   ↓
3. Click 🔄 (reload)
   ↓
4. Click "Service worker" (blue link)
   ↓
5. NEW window opens ← THIS IS WHERE YOU TEST!
   ↓
6. See logs: [Soma Background] Service worker loaded
   ↓
7. Run: chrome.runtime.sendMessage({ type: 'PING' }, console.log);
   ↓
8. See: {success: true, message: 'pong'} ✅
```

---

## Test Script (Copy-Paste This)

```javascript
// Copy this ENTIRE block into the Service Worker console:

async function quickTest() {
  console.log('🧪 Quick Test Starting...\n');
  
  try {
    // Test 1: Ping
    const ping = await chrome.runtime.sendMessage({ type: 'PING' });
    console.log('✅ PING:', ping);
    
    // Test 2: Get Settings
    const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    console.log('✅ GET_SETTINGS:', settings);
    
    // Test 3: Check Storage
    const storage = await chrome.storage.local.get('somaUserSettings');
    console.log('✅ STORAGE:', storage);
    
    console.log('\n🎉 All tests passed! Extension is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure you are in the Service Worker console!');
    console.log('   Go to chrome://extensions/ and click "Service worker"');
  }
}

quickTest();
```

---

## Need More Help?

Check the detailed guide: `TESTING_GUIDE.md`

Or verify your setup:
1. ✅ Extension loaded in Chrome
2. ✅ Service worker is "active" (not inactive)
3. ✅ Testing from Service Worker console (not webpage)
4. ✅ You see background logs in the console

---

**Remember:** The Service Worker console is a SEPARATE window from regular webpage DevTools!
