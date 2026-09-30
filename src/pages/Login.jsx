import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import '../styles/fonts.css';
import '../styles/theme.css';
import './Login.css';
export default function Login() {
  const {
    t
  } = useTranslation();
  return <div style={{
    position: 'relative',
    minHeight: '100vh',
    background: '#051a0e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Barlow', sans-serif",
    overflow: 'hidden'
  }}>
      {/* ── Blurred Slow-Motion Zoom Background Image for Login ─── */}
      <motion.div animate={{
      scale: [1, 1.14, 1]
    }} transition={{
      duration: 32,
      repeat: Infinity,
      ease: 'easeInOut'
    }} style={{
      position: 'fixed',
      inset: '-24px',
      // Extra margin to avoid white border during blur & zoom
      backgroundImage: "url('/farm_bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      filter: 'blur(14px) brightness(0.65)',
      WebkitFilter: 'blur(14px) brightness(0.65)',
      zIndex: 0,
      pointerEvents: 'none'
    }} />

      {/* Dark + green scrim */}
      <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      background: `
            linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%),
            radial-gradient(circle at 50% 40%, rgba(34,197,94,0.06) 0%, transparent 60%)
          `
    }} />

      {/* Top bar */}
      <header style={{
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2rem',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto'
    }}>
        <Link to="/" aria-label="AgriN — Home" style={{
        textDecoration: 'none'
      }}>
          <span style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontSize: '1.875rem',
          letterSpacing: '-0.04em',
          color: '#fff',
          lineHeight: 1
        }}>{t("agrin")}</span>
        </Link>

        <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.82rem',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        padding: '0.5rem 1.1rem',
        borderRadius: '9999px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s',
        fontFamily: "'Barlow', sans-serif"
      }}>
          <ArrowLeft size={14} />{t("back_to_home")}</Link>
      </header>

      {/* Centered auth card */}
      <main style={{
      position: 'relative',
      zIndex: 10,
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1.5rem 4rem'
    }}>
        <AuthCard />
      </main>
    </div>;
}