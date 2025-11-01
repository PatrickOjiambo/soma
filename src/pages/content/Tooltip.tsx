import React, { useEffect, useState } from 'react';

type TooltipState = {
  isVisible: boolean;
  x: number;
  y: number;
  originalWord: string;
  translatedWord: string;
  contextSentence?: string;
  expanded?: boolean;
};

const initialState: TooltipState = {
  isVisible: false,
  x: 0,
  y: 0,
  originalWord: '',
  translatedWord: '',
  contextSentence: undefined,
  expanded: false,
};

export default function Tooltip() {
  const [state, setState] = useState<TooltipState>(initialState);

  useEffect(() => {
    function onShow(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      setState((s) => ({
        ...s,
        isVisible: true,
        x: detail.x || 0,
        y: detail.y || 0,
        originalWord: detail.originalWord || '',
        translatedWord: detail.translatedWord || '',
        expanded: false,
        contextSentence: undefined,
      }));
    }

    function onHide() {
      setState((s) => ({ ...s, isVisible: false, expanded: false }));
    }

    function onExpand(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      setState((s) => ({
        ...s,
        isVisible: true,
        expanded: true,
        contextSentence: detail.contextSentence || '',
        x: detail.x || s.x,
        y: detail.y || s.y,
      }));
    }

    window.addEventListener('soma-tooltip-show', onShow as EventListener);
    window.addEventListener('soma-tooltip-hide', onHide as EventListener);
    window.addEventListener('soma-tooltip-expand', onExpand as EventListener);

    return () => {
      window.removeEventListener('soma-tooltip-show', onShow as EventListener);
      window.removeEventListener('soma-tooltip-hide', onHide as EventListener);
      window.removeEventListener('soma-tooltip-expand', onExpand as EventListener);
    };
  }, []);

  if (!state.isVisible) return <div style={{ display: 'none' }} />;

  // --- Style Definitions ---

  const style: React.CSSProperties = {
    position: 'fixed',
    left: state.x + 12, // Increased offset from cursor
    top: state.y + 12,  // Increased offset from cursor
    zIndex: 999999,
    background: '#FFFFFF', // Clean white background
    color: '#1F2937',     // Dark text (Tailwind gray-800)
    border: '1px solid #E5E7EB', // Light gray border (Tailwind gray-200)
    borderRadius: 12,          // Softer corners
    padding: '14px 18px',    // More breathing room
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', // Softer, lighter shadow
    minWidth: 180,
    maxWidth: 420,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.5,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#6B7280', // Muted gray (Tailwind gray-500)
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const buttonStyle: React.CSSProperties = {
    background: '#F9FAFB', // Very light gray (Tailwind gray-50)
    color: '#374151',      // Darker text (Tailwind gray-700)
    border: '1px solid #E5E7EB', // (Tailwind gray-200)
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  };

  const contextStyle: React.CSSProperties = {
    fontStyle: 'italic',
    color: '#4B5563', // (Tailwind gray-600)
    borderLeft: '3px solid #D1D5DB', // (Tailwind gray-300)
    paddingLeft: '12px',
    margin: '4px 0',
  };

  // --- End Style Definitions ---

  return (
    <div style={style} data-soma-tooltip>
      {!state.expanded ? (
        <div>
          <div style={labelStyle}>Original</div>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>
            {state.originalWord}
          </div>
          <div style={{ ...labelStyle, marginTop: 10 }}>Translation</div>
          <div style={{ fontSize: 16 }}>{state.translatedWord}</div>
        </div>
      ) : (
        <div>
          <div style={labelStyle}>Original</div>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>
            {state.originalWord}
          </div>
          <div style={{ ...labelStyle, marginTop: 10 }}>Translation</div>
          <div style={{ fontSize: 16, marginBottom: 12 }}>
            {state.translatedWord}
          </div>
          <div style={{ ...labelStyle, marginBottom: 4 }}>Example</div>
          <div style={contextStyle}>{state.contextSentence}</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button
              style={buttonStyle}
              onClick={() => {
                try {
                  const utter = new SpeechSynthesisUtterance(state.translatedWord || '');
                  speechSynthesis.cancel();
                  utter.lang = 'auto';
                  speechSynthesis.speak(utter);
                } catch (e) {
                  console.warn('Speech synthesis failed', e);
                }
              }}
            >
              🔊 Pronounce
            </button>
            <button
              style={{ ...buttonStyle, background: '#F3F4F6' }} // Secondary button style
              onClick={() => {
                // Close tooltip
                window.dispatchEvent(new CustomEvent('soma-tooltip-hide'));
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}