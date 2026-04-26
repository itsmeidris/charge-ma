/** Visible sliver (px) when a card is slid off-screen, sidebar-style. */
export const CARD_DRAG_PEEK = 30;

/** Width/height strip left visible when a card is “collapsed” (rail peek). */
export const SIDEBAR_PEEK = 44;

export function makeClampOffset(peek) {
  return (base, nextX, nextY) => {
    if (!base) return { x: nextX, y: nextY };
    const minX = -base.width + peek - base.left;
    const maxX = window.innerWidth - peek - base.left;
    const minY = -base.height + peek - base.top;
    const maxY = window.innerHeight - peek - base.top;
    return {
      x: Math.min(maxX, Math.max(minX, nextX)),
      y: Math.min(maxY, Math.max(minY, nextY)),
    };
  };
}
