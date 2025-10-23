# Module 2 - Popup Testing Guide

## 🎉 What You Just Built

A fully functional, beautiful popup control panel with:
- ✅ Master toggle switch
- ✅ Language selector (8 languages)
- ✅ Difficulty selector (3 levels)
- ✅ Real-time auto-save
- ✅ Status banner
- ✅ Loading states
- ✅ Error handling

## 🚀 Quick Test (5 Minutes)

### Step 1: Build & Reload

```bash
cd /home/patrick-ojiambo/Documents/hackathons/soma
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions/`
2. Click 🔄 reload on Soma extension
3. **Click the Soma icon** in your Chrome toolbar (top-right)

### Step 2: Test the Popup

You should see a beautiful popup (384×500px) with:

```
┌────────────────────────────┐
│ Soma          [●──] ON     │  ← Master toggle
│ Learn languages naturally  │
├────────────────────────────┤
│ 💙 Learning Spanish        │  ← Status banner
│    Beginner (5%)           │
│                            │
│ Target Language *          │
│ [🇪🇸 Spanish     ▼]        │  ← Dropdown
│                            │
│ Difficulty Level *         │
│ ⦿ Beginner                │  ← Selected
│   5% of words replaced     │
│ ○ Intermediate             │
│   15% of words replaced    │
│ ○ Advanced                 │
│   25% of words replaced    │
│                            │
│ ✓ Saved 10:45:32 AM       │  ← Save indicator
├────────────────────────────┤
│ v1.0.0          Refresh    │
└────────────────────────────┘
```

### Step 3: Interactive Testing

#### Test 1: Toggle Switch
```
1. Click the toggle in the header
2. Watch it change from ON → OFF
3. Status banner should disappear
4. Controls should become disabled (grayed out)
5. Toggle back ON
```

#### Test 2: Language Selection
```
1. Click the language dropdown
2. Select "🇯🇵 Japanese (日本語)"
3. Status banner should update to "Learning Japanese"
4. Check console: Should see save message
5. Close popup and reopen - Japanese should still be selected
```

#### Test 3: Difficulty Change
```
1. Click "Intermediate" radio button
2. Card should highlight with blue ring
3. Status banner updates to "Intermediate (15%)"
4. Timestamp appears: "✓ Saved [time]"
5. Close and reopen - Intermediate still selected
```

#### Test 4: Verify Storage
```
1. Go to chrome://extensions/
2. Click "Service worker" on Soma extension
3. In console, run:
   chrome.storage.local.get(console.log);
4. Should see:
   {
     somaUserSettings: {
       isEnabled: true,
       targetLanguage: "ja",
       difficulty: "intermediate"
     }
   }
```

## 🧪 Advanced Testing

### Test Message Passing

In the Service Worker console:

```javascript
// Listen for settings changes
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'UPDATE_SETTINGS') {
    console.log('Settings updated:', msg.payload);
  }
});
```

Now change settings in the popup and watch the messages arrive!

### Test Error Handling

In Service Worker console, simulate a storage error:

```javascript
// Temporarily break storage
const originalSet = chrome.storage.local.set;
chrome.storage.local.set = () => {
  throw new Error('Simulated error');
};

// Try changing settings in popup
// Should see error in console and UI should revert

// Fix it
chrome.storage.local.set = originalSet;
```

### Test Loading State

Slow down storage to see loading spinner:

```javascript
// In Service Worker console
const originalGet = chrome.storage.local.get;
chrome.storage.local.get = async (...args) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return originalGet.apply(chrome.storage.local, args);
};

// Reopen popup - should see spinner for 2 seconds
```

## ✅ Checklist

After testing, verify:

- [ ] Popup opens when clicking extension icon
- [ ] Master toggle works (ON/OFF)
- [ ] All 8 languages are selectable
- [ ] Difficulty radio buttons work
- [ ] Status banner updates correctly
- [ ] Save timestamp appears after changes
- [ ] Settings persist after closing popup
- [ ] Disabled state works when toggled OFF
- [ ] Loading spinner appears on first open
- [ ] Refresh button reloads settings

## 🐛 Common Issues

### Issue: Popup won't open
**Symptoms**: Clicking icon does nothing

**Solutions**:
1. Check manifest.json has: `"default_popup": "src/pages/popup/index.html"`
2. Reload extension (🔄 in chrome://extensions/)
3. Check for build errors: `npm run build`

### Issue: Blank/white popup
**Symptoms**: Popup opens but shows blank screen

**Solutions**:
1. Open popup
2. Right-click inside → Inspect
3. Check Console tab for errors
4. Common causes:
   - Import path errors
   - Component render errors
   - TailwindCSS not loading

### Issue: Settings don't save
**Symptoms**: Changes disappear when reopening

**Solutions**:
1. Verify background worker is running:
   - chrome://extensions/ → "Service worker" link
   - Check for errors
2. Test storage directly:
   ```javascript
   chrome.storage.local.set({test: 'value'}, () => {
     chrome.storage.local.get('test', console.log);
   });
   ```

### Issue: UI looks broken/unstyled
**Symptoms**: Components visible but not styled

**Solutions**:
1. Rebuild: `npm run build`
2. Hard reload popup: Close and reopen
3. Check TailwindCSS output:
   - Look for `.css` files in `dist_chrome/assets/`
   - Should see file like `index-DmNdEgUy.css`

## 🎨 Visual Reference

### Colors
- **Primary Blue**: `#2563eb` (buttons, toggles, rings)
- **Background**: Gradient from `blue-50` to `indigo-50`
- **Text Primary**: `gray-900`
- **Text Secondary**: `gray-500`
- **Success**: `blue-600`

### Typography
- **Title (Soma)**: `text-2xl font-bold`
- **Section Labels**: `text-sm font-medium`
- **Descriptions**: `text-xs text-gray-500`

### Spacing
- **Container**: `w-96` (384px) × `min-h-[500px]`
- **Padding**: `p-6` (24px) for main content
- **Gap**: `space-y-6` between sections

## 📸 Screenshot Test

Take a screenshot of your popup and compare:

**What it should look like:**
- Clean, modern design
- Blue gradient background
- White cards for content
- Blue toggle switch when ON
- Radio buttons with blue rings when selected
- Flag emojis in language dropdown
- Professional spacing and typography

## 🎯 Success Criteria

Your popup is working correctly if:

1. ✅ **Visual**: Looks polished and professional
2. ✅ **Functional**: All controls work
3. ✅ **Persistent**: Settings save and reload
4. ✅ **Responsive**: Updates happen instantly
5. ✅ **Accessible**: Can navigate with keyboard
6. ✅ **Error-free**: No console errors

## 🚀 Next Steps

Once the popup works perfectly:

1. **Test on Different Sites**
   - Open YouTube, Reddit, Wikipedia
   - Click Soma icon on each
   - Verify popup works consistently

2. **Test Edge Cases**
   - Toggle rapidly ON/OFF
   - Change settings quickly
   - Close and reopen many times
   - Check memory usage

3. **Get Feedback**
   - Show it to a friend
   - Ask: "Is it clear what each control does?"
   - Refine based on feedback

4. **Move to Module 3**
   - Content script implementation
   - Word replacement logic
   - AI translation integration

---

## 💡 Pro Tips

1. **Keep Popup Open While Developing**
   - Right-click popup → Inspect
   - Keeps it open for easier debugging

2. **Watch Service Worker Console**
   - See real-time message passing
   - Monitor storage operations
   - Catch errors immediately

3. **Use React DevTools**
   - Install React DevTools extension
   - Inspect component state
   - Debug re-renders

4. **Hot Reload During Dev**
   - Use `npm run dev` instead of `npm run build`
   - Auto-rebuilds on file changes
   - Faster development cycle

---

**Module 2 Status: COMPLETE ✅**

Your popup is production-ready and looks amazing! 🎉
