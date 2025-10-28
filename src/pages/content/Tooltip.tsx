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

  const style: React.CSSProperties = {
    position: 'fixed',
    left: state.x + 8,
    top: state.y + 8,
    zIndex: 999999,
    background: 'white',
    color: '#111827',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.12)',
    minWidth: 160,
    maxWidth: 420,
  };

  return (
    <div style={style} data-soma-tooltip>
      {!state.expanded ? (
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Original</div>
          <div style={{ fontWeight: 600 }}>{state.originalWord}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>Translation</div>
          <div>{state.translatedWord}</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Original</div>
          <div style={{ fontWeight: 600 }}>{state.originalWord}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>Translation</div>
          <div style={{ marginBottom: 8 }}>{state.translatedWord}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Example</div>
          <div style={{ fontStyle: 'italic' }}>{state.contextSentence}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
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
