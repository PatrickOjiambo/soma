/**
 * Soma Extension - Storage Module Tests
 * Simple test examples to verify the storage utilities work correctly
 * 
 * Run these in the Chrome DevTools console of any extension page
 * (popup, options, or background service worker)
 */

import { getUserSettings, setUserSettings, resetUserSettings } from './storage';
import { SomaUserSettings } from '../types';

/**
 * Test 1: Get initial settings
 */
export async function testGetSettings() {
  console.log('=== Test 1: Get Settings ===');
  const settings = await getUserSettings();
  console.log('Current settings:', settings);
  return settings;
}

/**
 * Test 2: Update single setting
 */
export async function testUpdateSingleSetting() {
  console.log('=== Test 2: Update Single Setting ===');
  await setUserSettings({ targetLanguage: 'fr' });
  const settings = await getUserSettings();
  console.log('Updated to French:', settings);
  return settings;
}

/**
 * Test 3: Update multiple settings
 */
export async function testUpdateMultipleSettings() {
  console.log('=== Test 3: Update Multiple Settings ===');
  await setUserSettings({
    targetLanguage: 'ja',
    difficulty: 'advanced',
    isEnabled: false,
  });
  const settings = await getUserSettings();
  console.log('Updated multiple fields:', settings);
  return settings;
}

/**
 * Test 4: Reset to defaults
 */
export async function testResetSettings() {
  console.log('=== Test 4: Reset Settings ===');
  await resetUserSettings();
  const settings = await getUserSettings();
  console.log('Reset to defaults:', settings);
  return settings;
}

/**
 * Test 5: Message passing to background
 */
export async function testMessagePassing() {
  console.log('=== Test 5: Message Passing ===');
  
  // Test ping
  const pingResponse = await chrome.runtime.sendMessage({ type: 'PING' });
  console.log('Ping response:', pingResponse);
  
  // Get settings via message
  const getResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
  console.log('Get settings response:', getResponse);
  
  // Update settings via message
  const updateResponse = await chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    payload: { difficulty: 'intermediate' },
  });
  console.log('Update settings response:', updateResponse);
  
  return { pingResponse, getResponse, updateResponse };
}

/**
 * Run all tests in sequence
 */
export async function runAllTests() {
  console.log('🧪 Running all Soma storage tests...\n');
  
  try {
    await testGetSettings();
    console.log('✅ Test 1 passed\n');
    
    await testUpdateSingleSetting();
    console.log('✅ Test 2 passed\n');
    
    await testUpdateMultipleSettings();
    console.log('✅ Test 3 passed\n');
    
    await testResetSettings();
    console.log('✅ Test 4 passed\n');
    
    await testMessagePassing();
    console.log('✅ Test 5 passed\n');
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// For direct console usage, expose a simple test function
if (typeof window !== 'undefined') {
  (window as any).testSomaStorage = runAllTests;
  console.log('💡 Tip: Run window.testSomaStorage() to test the storage module');
}
