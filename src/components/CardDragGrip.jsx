/**
 * Drags the parent card only from this control (see RoutePanel).
 */
import { IconDragGripArrows } from './icons/AppIcons.jsx';

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
        <IconDragGripArrows />
      </span>
    </button>
  );
}
