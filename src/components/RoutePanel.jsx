import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../data/cities.js';
import { CARD_DRAG_PEEK, makeClampOffset, SIDEBAR_PEEK } from '../utils/cardDrag.js';
import CardDragGrip from './CardDragGrip.jsx';

export default function RoutePanel({
  start, end, onStart, onEnd,
  onFetch, onClear,
  loading, error, route,
  pickingMode, onPickStart, onPickEnd, onCancelPick,
  showOffCorridor, onToggleOffCorridor,
  chauffeurMode = false,
}) {
  const panelRef = useRef(null);
  const baseRef = useRef(null);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(false);
  const [panelW, setPanelW] = useState(280);
  const isCustomStart = !CITIES.find(c => c.name === start.name);
  const isCustomEnd   = !CITIES.find(c => c.name === end.name);

  const clampFromPeek = useMemo(() => makeClampOffset(CARD_DRAG_PEEK), []);
  const clampOffset = useCallback(
    (nextX, nextY) => clampFromPeek(baseRef.current, nextX, nextY),
    [clampFromPeek]
  );

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    function measure() {
      setPanelW(el.offsetWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    function measureAndClamp() {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const currentOffset = offsetRef.current;
      baseRef.current = {
        left: rect.left - currentOffset.x,
        top: rect.top - currentOffset.y,
        width: rect.width,
        height: rect.height,
      };
      setOffset(prev => clampOffset(prev.x, prev.y));
    }
    measureAndClamp();
    window.addEventListener('resize', measureAndClamp);
    return () => window.removeEventListener('resize', measureAndClamp);
  }, [clampOffset, collapsed, panelW]);

  const collapseShift = collapsed ? -(panelW - SIDEBAR_PEEK) : 0;

  function onDragStart(e) {
    if (e.button !== 0) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offset,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onDragMove(e) {
    if (!dragRef.current || dragRef.current.id !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const next = clampOffset(
      dragRef.current.startOffset.x + dx,
      dragRef.current.startOffset.y + dy
    );
    setOffset(next);
  }

  function onDragEnd(e) {
    if (!dragRef.current || dragRef.current.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  const pointerHandlers = {
    onPointerDown: onDragStart,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragEnd,
  };

  const transform = `translate(${offset.x + collapseShift}px, ${offset.y}px)`;
  const t = dragging
    ? 'none'
    : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';

  function handleStart(e) {
    const city = CITIES.find(c => c.name === e.target.value);
    if (city) onStart(city);
  }
  function handleEnd(e) {
    const city = CITIES.find(c => c.name === e.target.value);
    if (city) onEnd(city);
  }

  return (
    <aside
      ref={panelRef}
      className={`route-panel glass3d${collapsed ? ' route-panel--collapsed' : ''}${chauffeurMode ? ' route-panel--driver' : ''}`}
      style={{
        transform,
        transition: t,
      }}
      aria-expanded={!collapsed}
    >
      <div className="route-panel__content">
        <div className="input-group">
          <label>Départ</label>
          <div className="input-with-pin">
            <select value={start.name} onChange={handleStart} aria-label="Départ">
              {isCustomStart && <option value={start.name}>{start.name}</option>}
              {CITIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <button
              type="button"
              className={`pin-btn${pickingMode === 'start' ? ' pin-btn--active' : ''}`}
              onClick={pickingMode === 'start' ? onCancelPick : onPickStart}
              title={pickingMode === 'start' ? 'Annuler' : 'Choisir sur la carte'}
              aria-label={pickingMode === 'start' ? 'Annuler' : 'Choisir sur la carte'}
            >
              {pickingMode === 'start' ? '✕' : '📍'}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label>Destination</label>
          <div className="input-with-pin">
            <select value={end.name} onChange={handleEnd} aria-label="Destination">
              {isCustomEnd && <option value={end.name}>{end.name}</option>}
              {CITIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <button
              type="button"
              className={`pin-btn${pickingMode === 'end' ? ' pin-btn--active' : ''}`}
              onClick={pickingMode === 'end' ? onCancelPick : onPickEnd}
              title={pickingMode === 'end' ? 'Annuler' : 'Choisir sur la carte'}
              aria-label={pickingMode === 'end' ? 'Annuler' : 'Choisir sur la carte'}
            >
              {pickingMode === 'end' ? '✕' : '📍'}
            </button>
          </div>
        </div>
        {route && (
          <label className="toggle-label route-panel__corridor">            
          </label>
        )}
        {error && <div className="route-error">⚠ {error}</div>}
        {route ? (
          <button className="btn-clear" onClick={onClear} aria-label="Effacer">
            ✕ Effacer le trajet
          </button>
        ) : (
          <button
            className="go-btn"
            onClick={onFetch}
            disabled={loading || start.name === end.name}
          >
            {loading ? <span className="spinner" /> : 'Afficher le trajet'}
          </button>
        )}
      </div>
      <div className="route-panel__side">
        <button
          type="button"
          className="card-sidebar-toggle"
          onClick={() =>
            setCollapsed(c => {
              const next = !c;
              if (next) setOffset({ x: 0, y: 0 });
              return next;
            })}
          title={collapsed ? 'Afficher le panneau' : 'Masquer le panneau'}
          aria-label={collapsed ? 'Afficher le panneau' : 'Masquer le panneau'}
          aria-pressed={collapsed}
        >
          <span className="card-sidebar-toggle__chev" aria-hidden>
            {collapsed ? '›' : '‹'}
          </span>
        </button>
        <CardDragGrip
          label="Déplacer le panneau (poignée seule)"
          {...pointerHandlers}
        />
      </div>
    </aside>
  );
}
