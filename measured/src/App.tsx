import { useEffect, useRef, useState } from 'react'

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85'
const FRONT_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4'
const OVERLAY_IMAGE = 'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png'

const NAV_ITEMS = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us']

type Point = { x: number; y: number }

function Mark() {
  return (
    <a href="#device" aria-label="Measured home" className="fixed left-5 top-5 z-50 grid h-12 w-12 place-items-center sm:left-7 sm:top-7">
      <svg width="28" height="28" viewBox="0 0 256 256" fill="none" aria-hidden="true">
        <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" fill="white" />
      </svg>
    </a>
  )
}

function ReserveButton({ className = '' }: { className?: string }) {
  return (
    <a href="#reserve" className={`liquid-glass inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 ${className}`}>
      <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,.7)]" />
      Reserve Yours
    </a>
  )
}

function Navigation({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return (
    <>
      <Mark />
      <nav aria-label="Main navigation" className="liquid-glass fixed left-1/2 top-7 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1.5 md:flex">
        {NAV_ITEMS.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-300 hover:bg-white/[.07] hover:text-white">
            {item}
          </a>
        ))}
      </nav>
      <ReserveButton className="fixed right-7 top-7 z-50 hidden md:inline-flex" />
      <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} className="liquid-glass fixed right-5 top-5 z-50 flex h-12 w-12 flex-col items-center justify-center gap-[6px] rounded-full md:hidden">
        <span className="block h-[1.5px] w-5 bg-white" />
        <span className="block h-[1.5px] w-3.5 translate-x-[3px] bg-white" />
      </button>
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex min-h-[100dvh] flex-col bg-[#0a0a0a] px-7 pb-9 pt-28 md:hidden">
      <button type="button" onClick={onClose} aria-label="Close menu" className="liquid-glass mobile-close fixed right-5 top-5 grid h-12 w-12 place-items-center rounded-full">
        <span className="absolute h-[1.5px] w-5 rotate-45 bg-white" />
        <span className="absolute h-[1.5px] w-5 -rotate-45 bg-white" />
      </button>
      <nav aria-label="Mobile navigation" className="flex flex-1 flex-col items-center justify-center gap-6">
        {NAV_ITEMS.map((item, index) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} onClick={onClose} className="mobile-menu-item text-3xl font-medium tracking-[-0.03em] text-white/90 transition hover:text-white sm:text-4xl" style={{ animationDelay: `${100 + index * 60}ms` }}>
            {item}
          </a>
        ))}
      </nav>
      <ReserveButton className="mobile-menu-item mx-auto" />
    </div>
  )
}

function GridLayer({ gridRef }: { gridRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={gridRef} className="pointer-events-none absolute -inset-8 z-0 opacity-10 will-change-transform" aria-hidden="true">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="measured-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#measured-grid)" />
      </svg>
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const reveal = revealRef.current
    const grid = gridRef.current
    if (!hero || !canvas || !reveal || !grid) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderScale = 0.5
    let target: Point = { x: window.innerWidth / 2, y: window.innerHeight * 0.72 }
    const smooth: Point = { ...target }
    const gridOffset: Point = { x: 0, y: 0 }
    let gridTarget: Point = { x: 0, y: 0 }
    let frame = 0
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      const bounds = hero.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      canvas.width = Math.max(1, Math.round(width * renderScale))
      canvas.height = Math.max(1, Math.round(height * renderScale))
    }

    const move = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect()
      target = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      gridTarget = {
        x: ((target.x - width / 2) / Math.max(width / 2, 1)) * 16,
        y: ((target.y - height / 2) / Math.max(height / 2, 1)) * 16,
      }
    }

    const draw = () => {
      smooth.x += (target.x - smooth.x) * 0.1
      smooth.y += (target.y - smooth.y) * 0.1
      gridOffset.x += (gridTarget.x - gridOffset.x) * 0.06
      gridOffset.y += (gridTarget.y - gridOffset.y) * 0.06

      const x = smooth.x * renderScale
      const y = smooth.y * renderScale
      const radius = 260 * renderScale
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.6, 'rgba(255,255,255,.75)')
      gradient.addColorStop(0.75, 'rgba(255,255,255,.4)')
      gradient.addColorStop(0.88, 'rgba(255,255,255,.12)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const mask = `url(${canvas.toDataURL('image/png')})`
      reveal.style.webkitMaskImage = mask
      reveal.style.maskImage = mask
      grid.style.transform = `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`
      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    hero.addEventListener('pointermove', move)
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      hero.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <main className="h-[100dvh] overflow-hidden bg-white">
      <section ref={heroRef} id="device" className="font-helvetica-neue relative h-[100dvh] min-h-[480px] overflow-hidden bg-[#0a0a0a] text-white">
        <GridLayer gridRef={gridRef} />

        <div className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />

        <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center px-3 sm:top-28 md:top-32">
          <h1 className="font-instrument text-center text-[4.5rem] uppercase leading-[0.9] tracking-[-0.045em] text-white xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem]">
            Measured
          </h1>
        </div>

        <img src={OVERLAY_IMAGE} alt="" className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover" />

        <div ref={revealRef} className="pointer-events-none absolute inset-0 z-30 [clip-path:inset(40%_0_0_0)] [mask-position:0_0] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-position:0_0] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]" aria-hidden="true">
          <video src={FRONT_VIDEO} autoPlay loop muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </section>
    </main>
  )
}
