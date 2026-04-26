/**
 * Drags the parent card only from this control (see RoutePanel).
 */
export default function CardDragGrip({
  label,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  return (
    <button
      type="button"
      className="card-drag-grip card-drag-grip--edge-right"
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <span className="card-drag-grip__arrows" aria-hidden>
        <svg className="card-drag-grip__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M7 7L4.5 4.5M4.5 4.5L7 2M7 17L4.5 19.5M4.5 19.5L7 22M17 7L19.5 4.5M19.5 4.5L17 2M17 17L19.5 19.5M19.5 19.5L17 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
