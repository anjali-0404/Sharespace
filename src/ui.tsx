import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes, HTMLAttributes, useRef } from 'react';

export const cn = (...a: ClassValue[]) => twMerge(clsx(a));

const V = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  outline: 'border border-zinc-200 bg-white hover:bg-zinc-50',
  ghost: 'hover:bg-zinc-100',
  danger: 'border border-red-200 text-red-700 bg-white hover:bg-red-50',
};

export function Button({
  v = 'primary',
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { v?: keyof typeof V }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none',
        V[v],
        className,
      )}
      {...p}
    />
  );
}

/* ---------- Card with mouse-tracked spotlight (optimized: writes CSS vars directly) ---------- */
export function Card({
  className,
  children,
  dark,
  ...p
}: HTMLAttributes<HTMLDivElement> & { dark?: boolean }) {
  const r = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={r}
      onMouseMove={e => {
        const b = r.current!.getBoundingClientRect();
        r.current!.style.setProperty('--x', e.clientX - b.left + 'px');
        r.current!.style.setProperty('--y', e.clientY - b.top + 'px');
      }}
      className={cn(
        'group/c relative rounded-2xl border shadow-sm transition-shadow',
        dark ? 'border-white/10 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white',
        className,
      )}
      {...p}
    >
      {/* spotlight layer — works best on dark surfaces (per 21st.dev research) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/c:opacity-100',
          dark
            ? '[background:radial-gradient(240px_circle_at_var(--x,50%)_var(--y,50%),rgba(52,211,153,.15),transparent_70%)]'
            : '[background:radial-gradient(240px_circle_at_var(--x,50%)_var(--y,50%),rgba(16,185,129,.08),transparent_70%)]',
        )}
      />
      {children}
    </div>
  );
}

/* ---------- Dark card variant for hero/feature sections ---------- */
const T: Record<string, string> = {
  g: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  a: 'bg-amber-50 text-amber-800 ring-amber-200',
  r: 'bg-red-50 text-red-700 ring-red-200',
  n: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
};

export const Badge = ({
  tone = 'n',
  className,
  ...p
}: HTMLAttributes<HTMLSpanElement> & { tone?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      T[tone],
      className,
    )}
    {...p}
  />
);

export const statusTone = (s: string) =>
  ({ approved: 'g', active: 'g', returned: 'g', pending: 'a', waitlisted: 'a', rejected: 'r', cancelled: 'n' } as Record<string, string>)[s] || 'n';
