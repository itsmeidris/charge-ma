import { useEffect, useRef, useState } from 'react';
import { runAppPreload } from '../utils/preloadAssets.js';

/** Minimum time on loader (portfolio showcase pace). */
const MIN_INTRO_MS = 4200;
/** Brief hold at 100% before exit — Studio375-style beat. */
const HOLD_AT_100_MS = 450;

export function useAppPreload() {
  const [displayPercent, setDisplayPercent] = useState(0);
  const [ready, setReady] = useState(false);
  const displayRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let assetProgress = 0;
    let assetsDone = false;
    let holdStart = null;
    const start = performance.now();
    let raf = 0;

    runAppPreload((p) => {
      assetProgress = p;
    }).then(() => {
      assetsDone = true;
    });

    function tick() {
      if (cancelled) return;

      const elapsed = performance.now() - start;
      const timeProgress = Math.min(elapsed / MIN_INTRO_MS, 1);
      const target = Math.min(1, Math.max(assetProgress, timeProgress));

      displayRef.current += (target * 100 - displayRef.current) * 0.065;
      const shown = Math.min(100, Math.floor(displayRef.current));
      setDisplayPercent(shown);

      const canFinish =
        assetsDone && elapsed >= MIN_INTRO_MS && displayRef.current >= 99.4;

      if (canFinish) {
        if (holdStart === null) holdStart = performance.now();
        if (performance.now() - holdStart >= HOLD_AT_100_MS) {
          setDisplayPercent(100);
          setReady(true);
          return;
        }
      } else {
        holdStart = null;
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return { displayPercent, ready };
}
