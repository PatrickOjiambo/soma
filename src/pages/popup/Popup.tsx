import React, { useState, useEffect } from 'react';

function Popup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default: Spanish
  const [percentage, setPercentage] = useState(10); // Default: 10%

  // Load saved settings when the popup opens
  useEffect(() => {
    // Safely call chrome.storage.sync.get only if available
    chrome.storage?.sync?.get(['somaSettings'], (result) => {
      if (result?.somaSettings) {
        const { isEnabled, targetLanguage, percentage } = result.somaSettings;
        setIsEnabled(isEnabled);
        setTargetLanguage(targetLanguage);
        setPercentage(percentage);
      }
    });
  }, []);

  // Send settings to the active tab's content script
  const handleApplySettings = () => {
    const settings = { isEnabled, targetLanguage, percentage };

    // 1. Save settings for future sessions
    chrome.storage.sync.set({ somaSettings: settings });

    // 2. Send message to the content script to apply changes now
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "applyLinguaFlow",
          settings: settings
        });
      }
    });
  };

  return (
    <div className="w-80 h-3/4 bg-slate-100 p-4 font-sans text-slate-800">
      <header className="text-center border-b border-slate-300 pb-3 mb-5">
        <h1 className="text-2xl font-bold text-slate-900">soma</h1>
        <p className="text-sm text-slate-600">Turn any website into a lesson.</p>
      </header>

      <main className="flex flex-col gap-y-5">
        {/* --- Enable/Disable Toggle --- */}
        <div className="flex justify-between items-center">
          <label htmlFor="enable-toggle" className="font-medium">Enable Soma</label>
          <label htmlFor="enable-toggle" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="enable-toggle"
              className="sr-only peer"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* --- Target Language Selection --- */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="language-select" className="font-medium">Target Language</label>
          <select
            id="language-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={!isEnabled}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>

        {/* --- Word Replacement Percentage --- */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="percentage-slider" className="font-medium">Immersion Level: {percentage}%</label>
          {/* <input
            id="percentage-slider"
            type="range"
            min="5" max="50" step="5"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            disabled={!isEnabled}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          /> */}
        </div>

        {/* --- Apply Button --- */}
        <button
          onClick={handleApplySettings}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply to Page
        </button>
      </main>
    </div>
  );
}

export default Popup;