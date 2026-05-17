import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAppPreload } from '../hooks/useAppPreload.js';

const TICKER = 'CHARGE \u2022 ROUTE \u2022 STATIONS \u2022 MOROCCO \u2022 ';

export default function IntroScreen({ onComplete }) {
  const { displayPercent, ready } = useAppPreload();
  const overlayRef = useRef(null);
  const curtainRef = useRef(null);
  const labelRef = useRef(null);
  const counterRef = useRef(null);
  const suffixRef = useRef(null);
  const brandRef = useRef(null);
  const lineTrackRef = useRef(null);
  const tickerTrackRef = useRef(null);
  const exitedRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        labelRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.15 },
      );
      gsap.fromTo(
        counterRef.current,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.25 },
      );
      gsap.fromTo(
        suffixRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.55 },
      );
      gsap.fromTo(
        brandRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.45 },
      );
      gsap.fromTo(
        lineTrackRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: 'power3.inOut', delay: 0.35 },
      );

      if (tickerTrackRef.current) {
        gsap.to(tickerTrackRef.current, {
          xPercent: -50,
          duration: 22,
          ease: 'none',
          repeat: -1,
        });
      }
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready || exitedRef.current) return;
    exitedRef.current = true;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete,
    });

    tl.to([labelRef.current, brandRef.current], {
      y: -16,
      opacity: 0,
      duration: 0.45,
      stagger: 0.04,
    })
      .to(
        counterRef.current,
        { scale: 1.08, opacity: 0, y: -24, duration: 0.55, ease: 'power3.in' },
        '-=0.35',
      )
      .to(suffixRef.current, { opacity: 0, duration: 0.3 }, '-=0.5')
      .to(lineTrackRef.current, { scaleX: 0, opacity: 0, duration: 0.4 }, '-=0.45')
      .to(
        curtainRef.current,
        { scaleY: 1, duration: 0.95, ease: 'power4.inOut' },
        '-=0.15',
      )
      .to(overlayRef.current, { opacity: 0, duration: 0.25 }, '-=0.12');
  }, [ready, onComplete]);

  const counterStr = String(displayPercent).padStart(2, '0');

  return (
    <div
      ref={overlayRef}
      className="intro-overlay"
      role="status"
      aria-live="polite"
      aria-label="Chargement"
      aria-valuenow={displayPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="intro-grain" aria-hidden="true" />

      <div className="intro-stage">
        <p ref={labelRef} className="intro-label">
          Loading
        </p>

        <div className="intro-counter-wrap">
          <span ref={counterRef} className="intro-counter" aria-hidden="true">
            {counterStr}
          </span>
          <span ref={suffixRef} className="intro-counter-suffix">
            %
          </span>
        </div>

        <p ref={brandRef} className="intro-brand">
          CHARGE.MA
        </p>

        <div ref={lineTrackRef} className="intro-line-track" aria-hidden="true">
          <div
            className="intro-line-fill"
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      </div>

      <div className="intro-ticker" aria-hidden="true">
        <div ref={tickerTrackRef} className="intro-ticker-track">
          <span>{TICKER}{TICKER}</span>
        </div>
      </div>

      <div ref={curtainRef} className="intro-curtain" aria-hidden="true" />
    </div>
  );
}

