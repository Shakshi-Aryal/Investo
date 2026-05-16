import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, GripVertical, X, Search } from 'lucide-react';

const STORAGE_KEY = 'investo-glossary-pos';
const FAB_SIZE = 56;
const PANEL_W = 300;
const PANEL_H = 380;
const MARGIN = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Visible viewport — accounts for mobile browser chrome via visualViewport when available. */
function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 360, height: 640 };
  }
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    offsetLeft: vv?.offsetLeft ?? 0,
    offsetTop: vv?.offsetTop ?? 0,
  };
}

function loadPosition() {
  if (typeof window === 'undefined') {
    return { x: 24, y: 24 };
  }
  const { width, height } = getViewportSize();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { x, y } = JSON.parse(saved);
      return {
        x: clamp(x, MARGIN, width - FAB_SIZE - MARGIN),
        y: clamp(y, MARGIN, height - FAB_SIZE - MARGIN),
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {
    x: width - FAB_SIZE - 24,
    y: height - FAB_SIZE - 100,
  };
}

function clampPosition(pos, open) {
  const { width, height } = getViewportSize();
  const w = open ? PANEL_W : FAB_SIZE;
  const h = open ? PANEL_H : FAB_SIZE;
  return {
    x: clamp(pos.x, MARGIN, Math.max(MARGIN, width - w - MARGIN)),
    y: clamp(pos.y, MARGIN, Math.max(MARGIN, height - h - MARGIN)),
  };
}

export default function GlossaryWidget() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState(loadPosition);
  const [dragging, setDragging] = useState(false);

  const rootRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const persistPosition = useCallback((pos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      /* quota / private mode */
    }
  }, []);

  useEffect(() => {
    const onResize = () => setPosition((p) => clampPosition(p, open));
    window.addEventListener('resize', onResize);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onResize);
    };
  }, [open]);

  useEffect(() => {
    setPosition((p) => clampPosition(p, open));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const onPointerDown = (e) => {
    if (!e.target.closest('.glossary-drag-handle')) return;
    e.preventDefault();
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const { width, height } = getViewportSize();
      const w = open ? PANEL_W : FAB_SIZE;
      const h = open ? PANEL_H : FAB_SIZE;
      const x = clamp(e.clientX - dragOffset.current.x, MARGIN, width - w - MARGIN);
      const y = clamp(e.clientY - dragOffset.current.y, MARGIN, height - h - MARGIN);
      setPosition({ x, y });
    };

    const onUp = () => {
      setDragging(false);
      setPosition((p) => {
        const clamped = clampPosition(p, open);
        persistPosition(clamped);
        return clamped;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, open, persistPosition]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResults(null);
    setError('');
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`,
      );
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      setResults(data[0] ?? null);
    } catch {
      setError('Term not found. Try another word.');
    } finally {
      setLoading(false);
    }
  };

  const widgetW = open ? PANEL_W : FAB_SIZE;
  const widgetH = open ? PANEL_H : FAB_SIZE;

  return (
    <>
      <style>{`
        .glossary-fab {
          position: fixed;
          z-index: 9998;
          touch-action: none;
          user-select: none;
        }
        .glossary-glass {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .glossary-drag-handle { cursor: grab; touch-action: none; }
        .glossary-drag-handle:active { cursor: grabbing; }
        @keyframes glossaryIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        ref={rootRef}
        className="glossary-fab"
        style={{
          left: position.x,
          top: position.y,
          width: widgetW,
          height: widgetH,
          transition: dragging ? 'none' : 'width 0.25s ease, height 0.25s ease',
        }}
        onPointerDown={onPointerDown}
      >
        {!open ? (
          <button
            type="button"
            className="glossary-glass glossary-drag-handle"
            onClick={() => setOpen(true)}
            aria-label="Open financial glossary"
            style={{
              width: FAB_SIZE,
              height: FAB_SIZE,
              borderRadius: 18,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              cursor: 'grab',
            }}
          >
            <BookOpen size={24} />
          </button>
        ) : (
          <div
            className="glossary-glass"
            style={{
              width: PANEL_W,
              height: PANEL_H,
              borderRadius: 20,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              animation: 'glossaryIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              className="glossary-drag-handle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: '1px solid var(--divider)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GripVertical size={16} color="var(--text-muted)" />
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: 0.6,
                    color: 'var(--accent)',
                  }}
                >
                  DRAGGABLE FINANCIAL GLOSSARY
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close glossary"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 12 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                className="inv-input"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. liquidity, beta, NAV…"
                style={{ paddingLeft: 36, fontSize: 13 }}
              />
            </form>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: 13, color: 'var(--text-main)' }}>
              {loading && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 16 }}>Looking up…</p>
              )}
              {error && (
                <p style={{ textAlign: 'center', color: 'var(--danger-color)', margin: 16 }}>{error}</p>
              )}
              {results && (
                <div>
                  <h4
                    style={{
                      margin: '0 0 8px',
                      fontFamily: 'var(--font-heading)',
                      textTransform: 'capitalize',
                      fontSize: 18,
                    }}
                  >
                    {results.word}
                  </h4>
                  {results.meanings?.slice(0, 2).map((m, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <span className="micro-badge micro-badge-accent" style={{ fontSize: 10 }}>
                        {m.partOfSpeech}
                      </span>
                      <p style={{ margin: '8px 0 0', lineHeight: 1.55, color: 'var(--text-muted)' }}>
                        {m.definitions?.[0]?.definition}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!loading && !error && !results && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24, lineHeight: 1.5 }}>
                  Drag anywhere on screen. Search financial terms instantly.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
