import { useRef, useEffect } from 'react';

/**
 * FadingVideo — smooth fade in/out looping video background.
 * @param {string | string[]} src - single URL or array for cycling
 * @param {string} className
 * @param {React.CSSProperties} style
 */
export default function FadingVideo({ src, className = '', style = {}, poster = '/farm_bg.jpg' }) {
  const videoRef = useRef(null);
  const sources = Array.isArray(src) ? src : [src];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Keep initial opacity 1 if poster is available or fade in smoothly
    video.style.opacity = '1';

    const handleEnded = () => {
      if (sources.length === 1) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <video
      ref={videoRef}
      src={sources[0]}
      poster={poster}
      className={className}
      style={{
        objectFit: 'cover',
        objectPosition: 'center center',
        transition: 'opacity 0.5s ease',
        ...style,
      }}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

