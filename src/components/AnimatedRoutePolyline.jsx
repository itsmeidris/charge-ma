import { useEffect, useRef, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { gsap } from 'gsap';

export default function AnimatedRoutePolyline({
  positions,
  color,
  weight = 5,
  opacity = 0.85,
  duration = 1.35,
}) {
  const [sliceEnd, setSliceEnd] = useState(2);
  const progressRef = useRef({ t: 0 });

  useEffect(() => {
    if (!positions?.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setSliceEnd(positions.length);
      return;
    }

    progressRef.current.t = 0;
    setSliceEnd(2);

    const len = positions.length;
    const tween = gsap.to(progressRef.current, {
      t: 1,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setSliceEnd(Math.max(2, Math.ceil(progressRef.current.t * len)));
      },
    });

    return () => tween.kill();
  }, [positions, duration]);

  if (!positions?.length || sliceEnd < 2) return null;

  return (
    <Polyline
      positions={positions.slice(0, sliceEnd)}
      color={color}
      weight={weight}
      opacity={opacity}
    />
  );
}
