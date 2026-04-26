import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import logoImg from '../assets/logo.png';

export default function IntroScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const overlayRef = useRef();
  const titleRef   = useRef();
  const percentRef = useRef();

  useEffect(() => {
    const start    = performance.now();
    const duration = 2200;

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        const tl = gsap.timeline({ onComplete });
        tl.to(percentRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' })
          .to(titleRef.current,   { scale: 1.15, opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.1')
          .to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.1');
      }
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <div ref={overlayRef} className="intro-overlay">
      <img ref={titleRef} src={logoImg} alt="CHARGE.MA" className="intro-logo" />
      <span ref={percentRef} className="intro-percent">{count}%</span>
    </div>
  );
}
