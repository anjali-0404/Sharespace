import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, Scale, History, ArrowRight, Check, X, Clock, Wrench, Boxes, Cpu,
  DoorOpen, Video, FlaskConical, Users, Sparkles, RotateCcw, LogOut, Lock, Mail, User as UserIcon,
} from 'lucide-react';
import { useApp, RES, CERTS, Res, Bk, Cert, User } from './store';
import { Button, Card, Badge, statusTone, cn } from './ui';
import {
  Words, Spotlight, Beams, AuroraBackground, GridPattern, Meteors, MovingButton,
  GradientText, CountUp, CardTilt, GlowCard,
} from './fx';

type Page = { p: 'home' | 'explore' | 'res' | 'dash' | 'owner' | 'log'; rid?: string };
type G = (p: Page['p'], rid?: string) => void;

const ICON: Record<string, typeof Boxes> = {
  Makerspace: Wrench, Compute: Cpu, Rooms: DoorOpen, Labs: FlaskConical, Media: Video,
};
const rn = (id: string) => RES.find((r) => r.id === id)!;

const Fade = ({ children, i = 0 }: { children: ReactNode; i?: number }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

/* ---------- Resource artwork with image + gradient fallback ---------- */
function Art({ r, className }: { r: Res; className?: string }) {
  const I = ICON[r.cat] || Boxes;
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br text-white/90', r.grad, className)}>
      {imgOk && (
        <img
          src={r.img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          onError={() => setImgOk(false)}
        />
      )}
      <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,#fff,transparent_40%)]" />
      <I className="absolute -bottom-4 -right-3 h-28 w-28 opacity-30" />
      <I className="relative m-5 h-8 w-8" />
    </div>
  );
}

export default function App() {
  const { token } = useApp();

  if (!token) return <Auth />;

  return <SignedIn />;
}

/* ================================================================
   AUTH PAGE (login + register)
   ================================================================ */
function Auth() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = mode === 'login' ? await login(email, password) : await register(name, email, password, role);
    if (!res.ok) setErr(res.error || 'Something went wrong.');
    setLoading(false);
  };

  const fillDemo = async (em: string, pw: string) => {
    setMode('login');
    setEmail(em);
    setPassword(pw);
    setErr('');
    setLoading(true);
    const res = await login(em, pw);
    if (!res.ok) setErr(res.error || 'Something went wrong.');
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 text-white">
      <AuroraBackground />
      <GridPattern variant="dots" />
      <Beams />
      <Spotlight />
      <Meteors count={6} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <button className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
              <Boxes className="h-5 w-5" />
            </span>
            ShareSpace
          </button>
        </div>

        <Card dark className="p-8">
          <div className="mb-6 flex rounded-full border border-white/10 bg-zinc-800/50 p-0.5 text-sm">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErr(''); }}
                className={cn('relative w-full rounded-full py-1.5 font-medium capitalize', mode === m ? 'text-white' : 'text-zinc-400')}
              >
                {mode === m && (
                  <motion.span layoutId="auth-tab" className="absolute inset-0 -z-10 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                      className="w-full rounded-xl border border-white/10 bg-zinc-800/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">I am a…</label>
                  <div className="flex gap-2">
                    {(['user', 'owner'] as const).map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={cn('flex-1 rounded-xl border py-2.5 text-sm font-medium transition', role === r ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-white/10 bg-zinc-800/50 text-zinc-400')}>
                        {r === 'user' ? 'Student' : 'Resource Owner'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {err && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
                {err}
              </motion.div>
            )}

            <Button className="w-full py-3" disabled={loading}>
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="mb-2 text-center text-xs text-zinc-500">Quick demo access — click to fill:</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('demo@sharespace.io', 'demo1234')}
                className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300 transition hover:border-brand-500/50 hover:bg-zinc-800">
                <span className="block font-medium text-zinc-200">Student</span>
                <span className="text-zinc-500">demo@sharespace.io</span>
                <span className="block text-zinc-500">demo1234</span>
              </button>
              <button onClick={() => fillDemo('owner@sharespace.io', 'owner1234')}
                className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300 transition hover:border-brand-500/50 hover:bg-zinc-800">
                <span className="block font-medium text-zinc-200">Owner</span>
                <span className="text-zinc-500">owner@sharespace.io</span>
                <span className="block text-zinc-500">owner1234</span>
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-zinc-600">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }} className="font-medium text-brand-400 hover:text-brand-300">
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   SIGNED-IN APP
   ================================================================ */
function SignedIn() {
  const [pg, setPg] = useState<Page>({ p: 'home' });
  const { role, setRole, bks, user } = useApp();
  const go = (p: Page['p'], rid?: string) => { setPg({ p, rid }); window.scrollTo(0, 0); };

  const links: [Page['p'], string][] =
    role === 'user'
      ? [['explore', 'Explore'], ['dash', 'My bookings'], ['log', 'Activity']]
      : [['owner', 'Owner console'], ['explore', 'Listings'], ['log', 'Activity']];
  const pend = bks.filter((b: Bk) => b.status === 'pending').length;

  return (
    <div className="min-h-screen">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 glass">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <button onClick={() => go('home')} className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Boxes className="h-4 w-4" />
            </span>
            ShareSpace
          </button>

          <nav className="ml-4 hidden gap-1 md:flex">
            {links.map(([p, l]) => (
              <button key={p + l} onClick={() => go(p)}
                className={cn('relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', pg.p === p ? 'text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100')}>
                {pg.p === p && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-zinc-100" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                {l}
                {p === 'owner' && pend > 0 && <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-xs text-white">{pend}</span>}
              </button>
            ))}
          </nav>

          {/* User menu */}
          <div className="ml-auto flex items-center gap-3">
            <UserBadge user={user} role={role} setRole={setRole} />
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {links.map(([p, l]) => (
            <button key={p + l} onClick={() => go(p)}
              className={cn('whitespace-nowrap rounded-lg px-3 py-1 text-sm', pg.p === p ? 'bg-zinc-900 text-white' : 'text-zinc-600')}>
              {l}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={pg.p + pg.rid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {pg.p === 'home' && <Home go={go} />}
            {pg.p === 'explore' && <Explore go={go} />}
            {pg.p === 'res' && <Detail rid={pg.rid!} go={go} />}
            {pg.p === 'dash' && <Dash go={go} />}
            {pg.p === 'owner' && <Owner />}
            {pg.p === 'log' && <Log />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        ShareSpace demo · sample data, state lives in your browser session
      </footer>
    </div>
  );
}

/* ---------- User badge + logout ---------- */
function UserBadge({ user, role, setRole }: { user: User | null; role: 'user' | 'owner'; setRole: (r: 'user' | 'owner') => void }) {
  const { logout } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm transition hover:bg-zinc-50">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </span>
        <span className="hidden font-medium text-zinc-700 sm:block">{user?.name || 'Guest'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
              <div className="border-b border-zinc-100 px-3 py-2">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-zinc-500">{user?.email}</div>
              </div>
              <div className="px-3 py-2">
                <div className="mb-1 text-xs font-medium text-zinc-400">View as</div>
                <div className="flex rounded-lg border border-zinc-200 p-0.5">
                  {(['user', 'owner'] as const).map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className={cn('flex-1 rounded-md px-2 py-1 text-xs font-medium', role === r ? 'bg-zinc-900 text-white' : 'text-zinc-500')}>
                      {r === 'user' ? 'Student' : 'Owner'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { logout(); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== HOME ===================== */
function Home({ go }: { go: G }) {
  const { bks, usage } = useApp();
  const stats: [number, string][] = [
    [RES.length, 'resources listed'],
    [bks.filter((b) => ['approved', 'active', 'returned'].includes(b.status)).length, 'bookings approved'],
    [Object.keys(usage).length, 'active members'],
  ];
  const feats: [typeof ShieldCheck, string, string, string][] = [
    [ShieldCheck, 'Verified before approved', 'Requirements, training and ID checks run before an owner ever sees the request.', 'sm:col-span-2'],
    [Scale, 'Fair by design', 'Weekly caps and a waitlist ranked by recent usage.', ''],
    [History, 'Every action on record', 'Approvals, returns and damage reports in one append-only history.', ''],
    [Users, 'Owners stay in control', 'Nothing is booked without a decision, and every rejection needs a reason.', 'sm:col-span-2'],
  ];

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <AuroraBackground />
        <GridPattern variant="dots" />
        <Beams />
        <Spotlight />
        <Meteors count={8} />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <Fade>
            <Badge tone="g" className="mb-5 border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 ring-emerald-400/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Trusted sharing for campuses and communities
            </Badge>
          </Fade>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            <Words text="Unlock the labs, tools and rooms sitting idle nearby." />
          </h1>
          <Fade i={4}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
              Book specialised equipment safely. Owners stay in control, access is fair, and every decision is explained.
            </p>
          </Fade>
          <Fade i={5}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MovingButton onClick={() => go('explore')}>Explore resources <ArrowRight className="h-4 w-4" /></MovingButton>
              <Button v="outline" className="border-white/20 bg-transparent px-6 py-3 text-white hover:bg-white/10" onClick={() => go('log')}>
                See the audit trail
              </Button>
            </div>
          </Fade>
          <Fade i={6}>
            <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {stats.map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl font-extrabold"><CountUp to={n} duration={1.2} /></div>
                  <div className="text-xs text-zinc-500">{l}</div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ---------- Features (dark cards with spotlight) ---------- */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3">
        {feats.map(([I, t, d, c], i) => (
          <Fade key={t} i={i}>
            <GlowCard className={cn('h-full', c)}>
              <Card dark className="h-full p-6">
                <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 ring-1 ring-brand-400/20">
                  <I className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mt-1 font-semibold text-zinc-100">{t}</h3>
                <p className="mt-1 text-sm text-zinc-400">{d}</p>
              </Card>
            </GlowCard>
          </Fade>
        ))}
      </section>

      {/* ---------- Popular ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">
            Popular <GradientText from="from-brand-600" to="via-brand-500" end="to-violet-500">right now</GradientText>
          </h2>
          <button onClick={() => go('explore')} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all <ArrowRight className="ml-0.5 inline h-3 w-3" />
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {RES.slice(0, 3).map((r) => <Tile key={r.id} r={r} go={go} />)}
        </div>
      </section>
    </div>
  );
}

/* ===================== TILE ===================== */
function Tile({ r, go }: { r: Res; go: G }) {
  const { busy } = useApp();
  const open = r.slots.filter((s) => !busy(r.id, s)).length;
  return (
    <CardTilt className="h-full">
      <motion.button whileHover={{ y: -4 }} onClick={() => go('res', r.id)} className="block h-full text-left">
        <Card className="h-full overflow-hidden">
          <Art r={r} className="h-32" />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <Badge>{r.cat}</Badge>
              <Badge tone={open ? 'g' : 'a'}>{open ? `${open} open` : 'Waitlist'}</Badge>
            </div>
            <h3 className="mt-2 font-semibold">{r.name}</h3>
            <p className="text-sm text-zinc-500">{r.owner}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {r.req.map((k) => <Badge key={k}>{CERTS[k]}</Badge>)}
            </div>
          </div>
        </Card>
      </motion.button>
    </CardTilt>
  );
}

/* ===================== EXPLORE ===================== */
function Explore({ go }: { go: G }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(RES.map((r) => r.cat)))];
  const list = RES.filter((r) => (cat === 'All' || r.cat === cat) && (r.name + r.desc + r.owner).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        Explore <GradientText from="from-brand-600" to="via-brand-500" end="to-violet-500">resources</GradientText>
      </h1>
      <div className="relative mt-5 max-w-lg">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search printers, GPUs, rooms…" aria-label="Search"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={cn('relative rounded-full border px-3 py-1 text-sm transition', cat === c ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white hover:border-zinc-300')}>
            {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-zinc-900" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            {c}
          </button>
        ))}
      </div>
      <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((r) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
              <Tile r={r} go={go} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <Card className="mt-6 p-10 text-center text-zinc-500">Nothing matches "{q}". Try a broader search or clear the category.</Card>}
    </div>
  );
}

/* ===================== DETAIL ===================== */
function Detail({ rid, go }: { rid: string; go: G }) {
  const r = rn(rid);
  const { busy, wait, certs, toggleCert, submit, usage, user } = useApp();
  const userName: string = user?.name || 'You';
  const [slot, setSlot] = useState(r.slots[0]);
  const [purpose, setPurpose] = useState('');
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <button onClick={() => go('explore')} className="text-sm text-zinc-500 transition hover:text-zinc-900">← All resources</button>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Art r={r} className="h-56 rounded-2xl" />
          <h1 className="mt-5 font-display text-3xl font-extrabold">{r.name}</h1>
          <p className="text-zinc-500">{r.owner} · {r.cat}</p>
          <p className="mt-3 text-zinc-700">{r.desc}</p>

          <h2 className="mt-6 font-semibold">What you need</h2>
          <Card className="mt-2 divide-y">
            {r.req.map((k) => (
              <div key={k} className="flex items-center justify-between p-3 text-sm">
                <span className="flex items-center gap-2">
                  {certs[k as Cert] ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-red-500" />}
                  {CERTS[k as Cert]}
                </span>
                <Button v="outline" className="px-3 py-1" onClick={() => toggleCert(k as Cert)}>
                  {certs[k as Cert] ? 'Revoke (demo)' : 'Verify (demo)'}
                </Button>
              </div>
            ))}
          </Card>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {r.dep > 0 && <Badge tone="a">Deposit ₹{r.dep}</Badge>}
            {r.sup && <Badge tone="a">Staff supervised</Badge>}
            <Badge>Limit {r.cap}h per week each</Badge>
          </div>
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Request access</h2>
          <div className="mt-3 grid gap-2">
            {r.slots.map((s) => {
              const b = busy(r.id, s); const w = wait(r.id, s).length;
              return (
                <button key={s} onClick={() => setSlot(s)}
                  className={cn('flex items-center justify-between rounded-xl border p-3 text-left text-sm transition', slot === s ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-zinc-200 hover:bg-zinc-50')}>
                  <span className="font-medium">{s}</span>
                  <Badge tone={b ? 'a' : 'g'}>{b ? `Taken · ${w} waiting` : 'Open'}</Badge>
                </button>
              );
            })}
          </div>
          <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} placeholder="What will you use it for?" aria-label="Purpose"
            className="mt-3 w-full rounded-xl border border-zinc-200 p-3 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          <Button
            className="mt-3 w-full py-2.5"
            disabled={submitting}
            onClick={async () => {
              if (submitting) return;
              setSubmitting(true);
              const result = await submit(r.id, slot, purpose);
              setRes(result);
              if (result.ok) setPurpose('');
              setSubmitting(false);
            }}
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : busy(r.id, slot) ? (
              'Join the waitlist'
            ) : (
              'Send request'
            )}
          </Button>
          <p className="mt-2 text-xs text-zinc-500">Your usage in the last 30 days: {usage[userName] || 0}h. Fewer hours ranks you higher on waitlists.</p>
          <AnimatePresence>
            {res && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={cn('mt-3 rounded-xl p-3 text-sm', res.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-800')} role="status">
                {res.msg}
                {res.ok && <button className="mt-2 block font-medium underline" onClick={() => go('dash')}>View in My bookings</button>}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

/* ===================== BOOKING ROW ===================== */
const Row = ({ b, children }: { b: Bk; children?: ReactNode }) => (
  <Card className="p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <div className="font-semibold">{rn(b.rid).name}</div>
        <div className="text-sm text-zinc-500">{b.slot} · {b.who} · "{b.purpose}"</div>
      </div>
      <Badge tone={statusTone(b.status)}>{b.status}</Badge>
    </div>
    <p className="mt-2 rounded-lg bg-zinc-50 p-2.5 text-sm text-zinc-700">{b.why}</p>
    {children && <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>}
  </Card>
);

/* ===================== DASHBOARD ===================== */
function Dash({ go }: { go: G }) {
  const { bks, act, user } = useApp();
  const userName: string = user?.name || 'You';
  const mine = bks.filter((b: Bk) => b.who === userName);
  const [err, setErr] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAct = async (k: string, id: number) => {
    setErr('');
    setLoadingId(id);
    const error = await act(k, id);
    if (error) setErr(String(error));
    setLoadingId(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        My <GradientText from="from-brand-600" to="via-brand-500" end="to-violet-500">bookings</GradientText>
      </h1>
      <p className="text-zinc-500">Every status comes with the reason behind it.</p>
      {err && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
          {err}
        </div>
      )}
      <div className="mt-6 grid gap-3">
        {mine.map((b: Bk, i: number) => (
          <Fade key={b.id} i={i}>
            <Row b={b}>
              {['pending', 'approved', 'waitlisted'].includes(b.status) && (
                <Button
                  v="danger"
                  disabled={loadingId === b.id}
                  onClick={() => handleAct('cancel', b.id)}
                >
                  Cancel
                </Button>
              )}
              {b.status === 'active' && (
                <Button
                  v="outline"
                  disabled={loadingId === b.id}
                  onClick={() => handleAct('ext', b.id)}
                >
                  <Clock className="h-4 w-4" />Request +1h
                </Button>
              )}
            </Row>
          </Fade>
        ))}
        {!mine.length && (
          <Card className="p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100"><Users className="h-7 w-7 text-zinc-300" /></div>
            <p className="mt-3 text-zinc-500">No bookings yet.</p>
            <Button className="mt-4" onClick={() => go('explore')}>Find a resource</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ===================== OWNER CONSOLE ===================== */
function Owner() {
  const { bks, act, reset } = useApp();
  const [note, setNote] = useState('');
  const [cond, setCond] = useState<Record<number, string>>({});
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);

  const c = (id: number) => cond[id] || 'Good';
  const sel = (b: Bk) => (
    <select aria-label="Condition" value={c(b.id)} onChange={(e) => setCond({ ...cond, [b.id]: e.target.value })}
      className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm transition focus:border-brand-500">
      {['Good', 'Minor wear', 'Damaged'].map((x) => <option key={x}>{x}</option>)}
    </select>
  );

  const handleAct = async (k: string, id: number, actionNote?: string) => {
    setErr('');
    setSuccess('');
    setLoadingId(id);
    const error = await act(k, id, actionNote);
    if (error) {
      setErr(String(error));
    } else {
      setNote('');
      setSuccess(`Action completed successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoadingId(null);
  };

  const handleReset = async () => {
    setErr('');
    setSuccess('');
    setResetting(true);
    try {
      await reset();
      setSuccess('Demo data reset successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setErr(e.message || 'Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  const grp = (st: string) => bks.filter((b: Bk) => b.status === st);
  const stat = [
    ['Awaiting decision', grp('pending').length],
    ['Ready for check-out', grp('approved').length],
    ['In use now', grp('active').length],
    ['Returned', grp('returned').length],
  ] as const;

  const Sec = ({ t, l, children }: { t: string; l: Bk[]; children: (b: Bk) => ReactNode }) =>
    l.length ? (
      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-semibold">{t}<span className="rounded-full bg-zinc-100 px-2 text-xs text-zinc-500">{l.length}</span></h2>
        <div className="mt-3 grid gap-3">{l.map((b) => <Row key={b.id} b={b}>{children(b)}</Row>)}</div>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">
          Owner <GradientText from="from-brand-600" to="via-brand-500" end="to-violet-500">console</GradientText>
        </h1>
        <Button v="outline" disabled={resetting} onClick={handleReset}>
          {resetting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-800" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Reset demo data
        </Button>
      </div>

      {success && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
          {success}
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
          {err}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat.map(([l, n]) => (
          <Card key={l} className="overflow-hidden p-4">
            <div className="font-display text-3xl font-extrabold text-brand-600"><CountUp to={n} duration={0.8} /></div>
            <div className="text-xs text-zinc-500">{l}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <label className="text-sm font-medium">Decision note <span className="text-zinc-400">(required to reject)</span></label>
        <input value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }} placeholder="e.g. Training certificate expired"
          className="mt-2 w-full rounded-lg border border-zinc-200 p-2.5 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </Card>

      <Sec t="Approval queue" l={grp('pending')}>
        {(b) => (<>
          <Button disabled={loadingId === b.id} onClick={() => handleAct('approve', b.id, note)}>
            <Check className="h-4 w-4" />Approve
          </Button>
          <Button v="danger" disabled={loadingId === b.id} onClick={() => handleAct('reject', b.id, note)}>
            <X className="h-4 w-4" />Reject
          </Button>
        </>)}
      </Sec>
      <Sec t="Check-out" l={grp('approved')}>
        {(b) => (<>
          {sel(b)}
          <Button disabled={loadingId === b.id} onClick={() => handleAct('out', b.id, c(b.id))}>Check out</Button>
        </>)}
      </Sec>
      <Sec t="In use: check-in and return" l={grp('active')}>
        {(b) => (<>
          {sel(b)}
          <Button disabled={loadingId === b.id} onClick={() => handleAct('back', b.id, c(b.id))}>Confirm return</Button>
          <Button v="danger" disabled={loadingId === b.id} onClick={() => handleAct('dmg', b.id, note)}>Report damage</Button>
        </>)}
      </Sec>
      <Sec t="Waitlisted" l={grp('waitlisted')}>{() => null}</Sec>
    </div>
  );
}

/* ===================== ACTIVITY LOG ===================== */
function Log() {
  const { log } = useApp();
  const dot: Record<string, string> = { g: 'bg-emerald-500', r: 'bg-red-500', n: 'bg-zinc-400' };
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        Activity <GradientText from="from-brand-600" to="via-brand-500" end="to-violet-500">history</GradientText>
      </h1>
      <p className="text-zinc-500">Every approval, rejection, cancellation, extension, check-out, return and incident.</p>
      <ol className="mt-6 space-y-4 border-l-2 border-zinc-200 pl-6">
        {log.map((e, i) => (
          <motion.li key={log.length - i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }} className="relative">
            <span className={cn('absolute -left-[31px] top-1.5 h-3 w-3 rounded-full ring-4 ring-zinc-50', dot[e.tone])} />
            <div className="font-medium">{e.action} <span className="text-sm font-normal text-zinc-500">{e.actor} · {new Date(e.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div className="text-sm text-zinc-600">{e.detail}</div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
