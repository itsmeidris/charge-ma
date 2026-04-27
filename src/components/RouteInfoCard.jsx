import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VEHICLE_TABLET_MQ } from '../utils/vehicleTablet.js';
import { SIDEBAR_PEEK } from '../utils/cardDrag.js';
import locationIcon from '../assets/icons/location.svg';
import evChargeIcon from '../assets/icons/ev_charge_icon.svg';
import mapIcon      from '../assets/icons/map_icon.svg';
import timeIcon     from '../assets/icons/time_icon.svg';
import SidebarToggleButton from './ui/SidebarToggleButton.jsx';

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export default function RouteInfoCard({ route, start, end, corridorCount, chauffeurMode = false }) {
  const cardRef = useRef(null);
  const [anim, setAnim] = useState(0);
  const [mediaDriver, setMediaDriver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cardW, setCardW] = useState(400);
  const isDriver = !!chauffeurMode || mediaDriver;

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    function measure() {
      setCardW(el.offsetWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isDriver]);

  useEffect(() => {
    const mq = window.matchMedia(VEHICLE_TABLET_MQ);
    const sync = () => setMediaDriver(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const DURATION = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const t     = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnim(eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const animDist  = (route.distance  * anim).toFixed(0);
  const animSec   = Math.round(route.duration * anim);
  const animBornes = Math.round(corridorCount * anim);

  const sections = [
    { label: 'Station de départ',     icon: locationIcon, value: start.name },
    { label: 'Station d\'arrivée',    icon: locationIcon, value: end.name },
    { label: 'Nombre de bornes',   icon: evChargeIcon, value: `${animBornes} Bornes sur le trajet` },
    { label: 'Distance estimée', icon: mapIcon,      value: `~ ${animDist} km` },
    { label: 'Temps estimé',     icon: timeIcon,     value: `~${formatTime(animSec)}` },
  ];

  const collapseShift = collapsed ? -(cardW - SIDEBAR_PEEK) : 0;
  const t = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';

  const cardClass = `ric-card glass3d${isDriver ? ' ric-card--driver-layout' : ''}${collapsed ? ' ric-card--collapsed' : ''}`;

  const side = (
    <div className="ric-card__side">
      <SidebarToggleButton
        collapsed={collapsed}
        onClick={() => setCollapsed(c => !c)}
        expandedLabel="Masquer la fiche trajet"
        collapsedLabel="Afficher la fiche trajet"
      />
    </div>
  );

  if (isDriver) {
    return (
      <div
        ref={cardRef}
        className={cardClass}
        style={{ transform: `translateX(${collapseShift}px)`, transition: t }}
        aria-expanded={!collapsed}
      >
        <div className="ric-card__body ric-card__body--driver">
          <div className="ric-driver-cells">
            {sections.map(({ label, icon, value }) => (
              <div key={label} className="ric-box">
                <p className="ric-label">{label}</p>
                <div className="ric-row">
                  <img src={icon} alt="" className="ric-icon" />
                  <span className="ric-value">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="ric-progress-track">
            <div className="ric-progress-fill" style={{ width: `${anim * 100}%` }} />
          </div>
        </div>
        {side}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={cardClass}
      style={{ transform: `translateX(${collapseShift}px)`, transition: t }}
      aria-expanded={!collapsed}
    >
      <div className="ric-card__body">
        {sections.map(({ label, icon, value }) => (
          <div key={label} className="ric-section">
            <p className="ric-label">{label}</p>
            <div className="ric-row">
              <img src={icon} alt="" className="ric-icon" />
              <span className="ric-value">{value}</span>
            </div>
          </div>
        ))}
        <div className="ric-progress-track">
          <div className="ric-progress-fill" style={{ width: `${anim * 100}%` }} />
        </div>
      </div>
      {side}
    </div>
  );
}
