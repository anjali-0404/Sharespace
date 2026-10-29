import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import {
  ButtonHTMLAttributes,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { cn } from './ui';

/* =========================================================
   Word-by-word text reveal (improved with stagger + blur)
   ========================================================= */
export const Words = ({ text }: { text: string }) => (
  <>
    {text.split(' ').map((w, i) => (
      <motion.span
        key={i}
        className="mr-[.25em] inline-block"
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {w}
      </motion.span>
    ))}
  </>
);

/* =========================================================
   Spotlight glow (hero) — radial light that breathes
   ========================================================= */
export const Spotlight = () => (
  <motion.div
    aria-hidden
    className="pointer-events-none absolute -top-48 left-1/2 h-[32rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.35),transparent)]"
    animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.07, 1] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* =========================================================
   Beams — animated SVG paths for the hero
   ========================================================= */
const P = [
  'M-50 80 C200 20 400 220 900 60',
  'M-50 200 C250 120 500 320 950 160',
  'M-50 320 C300 240 600 420 1000 260',
  'M100 -20 C260 140 420 80 700 380',
];
export const Beams = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
    viewBox="0 0 900 420"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="bg" x1="0" x2="1">
        <stop offset="0" stopColor="#10b981" stopOpacity="0" />
        <stop offset=".5" stopColor="#34d399" />
        <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
      </linearGradient>
    </defs>
    {P.map((d, i) => (
      <g key={i}>
        <path d={d} stroke="#ffffff10" fill="none" />
        <motion.path
          d={d}
          stroke="url(#bg)"
          strokeWidth="1.4"
          fill="none"
          initial={{ pathLength: 0.15, pathOffset: 0 }}
          animate={{ pathOffset: [0, 0.85] }}
          transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
        />
      </g>
    ))}
  </svg>
);

/* =========================================================
   Aurora Background — animated gradient blobs (Aceternity)
   ========================================================= */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute -left-1/4 top-1/4 h-1/2 w-1/2 animate-aurora-first rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="absolute -right-1/4 top-0 h-1/2 w-1/2 animate-aurora-second rounded-full bg-violet-500/15 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-1/2 w-1/2 animate-aurora-third rounded-full bg-teal-500/15 blur-[120px]" />
    </div>
  );
}

/* =========================================================
   Grid pattern — dot or line grid background
   ========================================================= */
export function GridPattern({ variant = 'dots', className }: { variant?: 'dots' | 'lines'; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0',
        variant === 'dots' ? 'bg-dot-grid' : 'bg-line-grid',
        className,
      )}
    />
  );
}

/* =========================================================
   Meteors — subtle shooting stars for dark sections
   ========================================================= */
export function Meteors({ count = 12 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const pos = Math.random() * 100;
        const delay = Math.random() * 4;
        return (
          <span
            key={i}
            className="absolute top-0 animate-meteor"
            style={{
              left: `${pos}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <span className="block h-0.5 w-0.5 rounded-full bg-white/80 shadow-[0_0_0_4px_rgba(255,255,255,.1)]" />
          </span>
        );
      })}
    </div>
  );
}

/* =========================================================
   Moving Border Button (conic gradient) — enhanced with shimmer
   ========================================================= */
export function MovingButton({
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="group relative overflow-hidden rounded-xl p-[1.5px] transition active:scale-[.98]"
    >
      <motion.span
        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_68%,#34d399,#818cf8,transparent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <span className="relative flex items-center gap-2 rounded-[11px] bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition group-hover:bg-zinc-900">
        {children}
      </span>
    </button>
  );
}

/* =========================================================
   Shimmer Button — shine sweep on hover (21st.dev style)
   ========================================================= */
export function ShimmerButton({
  children,
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98]',
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}

/* =========================================================
   Gradient Text — animated gradient for headings
   ========================================================= */
export function GradientText({
  children,
  className,
  from = 'from-emerald-400',
  to = 'via-emerald-300',
  end = 'to-violet-400',
}: {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  end?: string;
}) {
  return (
    <span
      className={cn(
        'text-gradient bg-gradient-to-r bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]',
        from,
        to,
        end,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* =========================================================
   Count Up — animated number counter (runs on in-view)
   ========================================================= */
export function CountUp({
  to,
  duration = 1.5,
  className,
  suffix,
}: {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: v => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  );
}

/* =========================================================
   Card Tilt — 3D perspective tilt on hover (Aceternity / 21st.dev)
   ========================================================= */
export function CardTilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], ['8deg', '-8deg']), { stiffness: 300, damping: 20 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], ['-8deg', '8deg']), { stiffness: 300, damping: 20 });

  const handle = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handle}
      onMouseLeave={reset}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      className={cn('perspective-1000', className)}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   Border Beam — animated light traveling along a card border
   ========================================================= */
export function BorderBeam({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        className,
      )}
    >
      <div className="absolute -left-1/4 top-1/2 h-px w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
    </div>
  );
}

/* =========================================================
   Glow Card — wrapper that adds a soft glow border on hover
   ========================================================= */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('group/glow relative', className)}>
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-400/0 via-brand-400/20 to-violet-400/0 opacity-0 blur transition-opacity duration-500 group-hover/glow:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}
