import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * BlurText — word-by-word staggered blur-in animation (Framer Motion + IntersectionObserver).
 * @param {string} text - The text to animate
 * @param {string} className - Additional CSS classes
 */
export default function BlurText({ text, className = '' }) {
  const words = text.split(' ');
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '0.1em',
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
            delay: i * 0.1,
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
