import { useEffect, useRef } from 'react';
import { Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FarmScene from './FarmScene';
const SPOTLIGHT_RADIUS = 250;
export default function AgriLandingVisual() {
  const {
    t
  } = useTranslation();
  const visualRef = useRef(null);
  const canvasRef = useRef(null);
  const revealRef = useRef(null);
  const gridRef = useRef(null);
  useEffect(() => {
    const visual = visualRef.current;
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    const grid = gridRef.current;
    if (!visual || !canvas || !reveal || !grid) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const renderScale = 0.5;
    const bounds = visual.getBoundingClientRect();
    let width = bounds.width;
    let height = bounds.height;
    let target = {
      x: width * 0.52,
      y: height * 0.7
    };
    const smooth = {
      ...target
    };
    let gridTarget = {
      x: 0,
      y: 0
    };
    const gridOffset = {
      x: 0,
      y: 0
    };
    let animationFrame = 0;
    const resize = () => {
      const nextBounds = visual.getBoundingClientRect();
      width = nextBounds.width;
      height = nextBounds.height;
      canvas.width = Math.max(1, Math.round(width * renderScale));
      canvas.height = Math.max(1, Math.round(height * renderScale));
    };
    const trackPointer = event => {
      const currentBounds = visual.getBoundingClientRect();
      target = {
        x: event.clientX - currentBounds.left,
        y: event.clientY - currentBounds.top
      };
      gridTarget = {
        x: (target.x - width / 2) / Math.max(width / 2, 1) * 16,
        y: (target.y - height / 2) / Math.max(height / 2, 1) * 16
      };
    };
    const paint = () => {
      smooth.x += (target.x - smooth.x) * 0.1;
      smooth.y += (target.y - smooth.y) * 0.1;
      gridOffset.x += (gridTarget.x - gridOffset.x) * 0.06;
      gridOffset.y += (gridTarget.y - gridOffset.y) * 0.06;
      const x = smooth.x * renderScale;
      const y = smooth.y * renderScale;
      const radius = SPOTLIGHT_RADIUS * renderScale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.6, 'rgba(255,255,255,.75)');
      gradient.addColorStop(0.75, 'rgba(255,255,255,.4)');
      gradient.addColorStop(0.88, 'rgba(255,255,255,.12)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      const maskImage = `url(${canvas.toDataURL('image/png')})`;
      reveal.style.webkitMaskImage = maskImage;
      reveal.style.maskImage = maskImage;
      grid.style.transform = `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`;
      animationFrame = requestAnimationFrame(paint);
    };
    resize();
    window.addEventListener('resize', resize);
    visual.addEventListener('pointermove', trackPointer);
    animationFrame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      visual.removeEventListener('pointermove', trackPointer);
    };
  }, []);
  return <div ref={visualRef} className="login-visual">
      <FarmScene className="farm-scene-muted" showInsights={false} />

      <div ref={gridRef} className="login-parallax-grid" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="agrin-landing-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d8fff0" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agrin-landing-grid)" />
        </svg>
      </div>

      <div className="login-hero-word" aria-hidden="true">{t("agrin")}</div>
      <div className="login-atmosphere" aria-hidden="true" />

      <div ref={revealRef} className="login-spotlight-layer" aria-hidden="true">
        <FarmScene className="farm-scene-vivid" />
      </div>
      <canvas ref={canvasRef} className="login-mask-canvas" aria-hidden="true" />

      <div className="login-brand agrin-liquid-glass">
        <h1>
          <Leaf size={29} /> {t('appName')}
        </h1>
        <p>{t('globalNetwork')}</p>
      </div>

      <div className="login-live-pill agrin-liquid-glass">
        <span /> {t('liveData')}
      </div>
    </div>;
}