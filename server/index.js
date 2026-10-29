import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const RES = JSON.parse(fs.readFileSync(path.join(dir, '../shared/resources.json')));
const DB = path.join(dir, 'db.json');

/* ---------- password hashing (scrypt) ---------- */
const hashPass = (pw) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return salt + ':' + hash;
};
const checkPass = (pw, stored) => {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(pw, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test));
};

/* ---------- token helpers (base64 JSON, no external dep) ---------- */
const makeToken = (u) =>
  Buffer.from(JSON.stringify({ uid: u.id, name: u.name, email: u.email, role: u.role })).toString('base64');
const parseToken = (tok) => {
  try {
    return JSON.parse(Buffer.from(tok, 'base64').toString());
  } catch {
    return null;
  }
};

/* ---------- seed data ---------- */
const seed = () => ({
  nextUid: 100,
  users: [
    {
      id: 1,
      name: 'You',
      email: 'demo@sharespace.io',
      pass: hashPass('demo1234'),
      role: 'user',
    },
    {
      id: 2,
      name: 'Admin',
      email: 'owner@sharespace.io',
      pass: hashPass('owner1234'),
      role: 'owner',
    },
  ],
  certs: { id: true, t3d: false, hv: false, sup: false },
  usage: { You: 2, Arjun: 6, Meera: 1, Dev: 0 },
  nextBid: 10,
  bks: [
    { id: 3, rid: 'r2', slot: 'Wed 18–20', who: 'Dev', purpose: 'Fine-tune a small model', status: 'approved', why: 'Supervisor sign-off on file.' },
    { id: 2, rid: 'r1', slot: 'Thu 14–16', who: 'Meera', purpose: 'Gear test print', status: 'pending', why: 'Waiting for the owner.' },
    { id: 1, rid: 'r1', slot: 'Thu 10–12', who: 'Arjun', purpose: 'Prototype enclosure', status: 'approved', why: 'Meets all requirements.' },
  ],
  log: [{ t: new Date().toISOString(), actor: 'System', action: 'Server started', detail: 'Seed data loaded', tone: 'n' }],
});

let S = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, 'utf8')) : seed();
// ensure shape for older db files
if (!S.users) { const fresh = seed(); S.users = fresh.users; S.nextUid = fresh.nextUid; S.nextBid = S.nextBid || fresh.nextBid; }

const save = () => fs.writeFileSync(DB, JSON.stringify(S, null, 1));
const L = (actor, action, detail, tone = 'n') => {
  S.log.unshift({ t: new Date().toISOString(), actor, action, detail, tone });
  S.log = S.log.slice(0, 300);
};

const ACTIVE = ['pending', 'approved', 'active'];
const busy = (rid, s) => S.bks.find((b) => b.rid === rid && b.slot === s && ACTIVE.includes(b.status));
const wait = (rid, s) =>
  S.bks.filter((b) => b.rid === rid && b.slot === s && b.status === 'waitlisted').sort((a, b) => S.usage[a.who] - S.usage[b.who] || a.id - b.id);

const app = express();
app.use(express.json({ limit: '64kb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-role');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* ---------- auth middleware ---------- */
function auth(req, res, next) {
  const tok = req.headers.authorization?.replace('Bearer ', '');
  req.user = tok ? parseToken(tok) : null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in first.' });
  next();
}

function requireOwner(req, res, next) {
  // accept either token role or x-role header (for demo toggle)
  const isOwner = req.user?.role === 'owner' || req.get('x-role') === 'owner';
  if (!isOwner) return res.status(403).json({ error: 'Owner role required for this action.' });
  next();
}

/* ---------- auth endpoints ---------- */
app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role === 'owner' ? 'owner' : 'user';

  if (!name || name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (S.users.find((u) => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' });

  const user = { id: ++S.nextUid, name, email, pass: hashPass(password), role };
  S.users.push(user);
  S.usage[name] = S.usage[name] || 0;
  L(name, 'Account created', `${email} as ${role}`, 'g');
  save();
  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = S.users.find((u) => u.email === email);
  if (!user || !checkPass(password, user.pass))
    return res.status(401).json({ error: 'Wrong email or password.' });
  L(user.name, 'Signed in', email, 'n');
  save();
  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/logout', auth, requireAuth, (req, res) => {
  L(req.user.name, 'Signed out', '', 'n');
  save();
  res.json({ ok: true });
});

/* ---------- state ---------- */
app.get('/api/state', auth, (req, res) => {
  res.json({
    user: req.user || null,
    certs: S.certs,
    bks: S.bks,
    log: S.log,
    usage: S.usage,
    resources: RES,
  });
});

/* ---------- reset ---------- */
app.post('/api/reset', auth, requireOwner, (req, res) => {
  S = seed();
  save();
  res.json({ ok: true });
});

/* ---------- certs ---------- */
app.post('/api/certs/:k', auth, requireAuth, (req, res) => {
  const k = req.params.k;
  if (!(k in S.certs)) return res.status(404).json({ error: 'Unknown requirement' });
  S.certs[k] = !S.certs[k];
  const who = req.user?.name || 'You';
  L('Institution', 'Verification', `${k} ${S.certs[k] ? 'granted' : 'revoked'} for ${who}`);
  save();
  res.json(S.certs);
});

/* ---------- bookings ---------- */
app.post('/api/bookings', auth, requireAuth, (req, res) => {
  const who = req.user?.name || 'You';
  const { rid, slot } = req.body;
  const purpose = String(req.body.purpose || '').trim().slice(0, 300);
  const rsc = RES.find((x) => x.id === rid);
  if (!rsc || !rsc.slots.includes(slot)) return res.status(400).json({ ok: false, msg: 'Unknown resource or slot.' });
  if (!purpose) return res.json({ ok: false, msg: 'Add a short purpose so the owner knows why you need it.' });

  const miss = rsc.req.filter((k) => !S.certs[k]);
  if (miss.length) {
    L(who, 'Blocked', `${rsc.name}: missing ${miss.join(', ')}`, 'r');
    save();
    return res.json({ ok: false, msg: 'Missing requirements: ' + miss.join(', ') });
  }

  if (S.bks.some((b) => b.who === who && b.rid === rid && b.slot === slot && ['pending', 'approved', 'active', 'waitlisted'].includes(b.status)))
    return res.json({ ok: false, msg: 'You already have a request for this slot.' });

  const held = S.bks.filter((b) => b.who === who && b.rid === rid && ACTIVE.includes(b.status)).length * 2;
  const b = { id: ++S.nextBid, rid, slot, who, purpose, status: 'pending', why: "Waiting for the owner's decision." };

  if (held + 2 > rsc.cap) {
    b.status = 'rejected';
    b.why = `Fair-use limit: ${rsc.cap} hours per week per person. You already hold ${held}h, so others get a turn first.`;
    L('System', 'Auto-declined', `#${b.id} ${b.why}`, 'r');
  } else if (busy(rid, slot)) {
    b.status = 'waitlisted';
    S.bks.unshift(b);
    const pos = wait(rid, slot).findIndex((x) => x.id === b.id) + 1;
    b.why = `Slot is taken. Waitlist is ranked by hours used in the last 30 days (fewest first), then request time. You used ${S.usage[who] || 0}h, so you are #${pos}.`;
    L('System', 'Waitlisted', `#${b.id} ${rsc.name} · ${slot}`);
  } else {
    L(who, 'Requested', `#${b.id} ${rsc.name} · ${slot}`);
  }

  if (!S.bks.includes(b)) S.bks.unshift(b);
  save();
  res.json({ ok: b.status !== 'rejected', msg: b.why, booking: b });
});

const FLOW = {
  approve: ['pending'],
  reject: ['pending', 'waitlisted'],
  out: ['approved'],
  back: ['active'],
  dmg: ['active'],
  cancel: ['pending', 'approved', 'waitlisted'],
  ext: ['active'],
};

app.post('/api/bookings/:id/:k', auth, requireAuth, (req, res) => {
  const b = S.bks.find((x) => x.id === +req.params.id);
  const k = req.params.k;
  const note = String(req.body.note || '').trim().slice(0, 300);

  if (!b || !FLOW[k]) return res.status(404).json({ error: 'Not found' });

  const who = req.user?.name || 'You';
  const isOwner = req.user?.role === 'owner' || req.get('x-role') === 'owner';

  // Only the booking owner can cancel, only owners can approve/reject/out/back/dmg
  if (k === 'cancel') {
    if (b.who !== who && !isOwner) return res.status(403).json({ error: 'You can only cancel your own booking.' });
  } else if (k === 'ext') {
    if (b.who !== who) return res.status(403).json({ error: 'You can only extend your own booking.' });
  } else {
    if (!isOwner) return res.status(403).json({ error: 'Owner role required for this action.' });
  }

  if (!FLOW[k].includes(b.status)) return res.status(409).json({ error: `Cannot ${k} a booking that is ${b.status}.` });

  const promote = () => {
    const w = wait(b.rid, b.slot).find((x) => x.id !== b.id);
    if (w) {
      w.status = 'pending';
      w.why = 'Promoted from the waitlist (fewest recent hours). Waiting for the owner.';
      L('System', 'Promoted', `#${w.id} moved to pending`, 'g');
    }
  };

  if (k === 'approve') { b.status = 'approved'; b.why = 'Approved by owner. ' + (note || 'Requirements verified.'); L('Owner', 'Approved', `#${b.id} ${b.rid}`, 'g'); }
  if (k === 'reject') { if (!note) return res.status(400).json({ error: 'Enter a reason. Users are always told why.' }); b.status = 'rejected'; b.why = 'Rejected: ' + note; L('Owner', 'Rejected', `#${b.id} ${note}`, 'r'); promote(); }
  if (k === 'cancel') { b.status = 'cancelled'; b.why = 'Cancelled by requester.'; L(b.who, 'Cancelled', `#${b.id}`); promote(); }
  if (k === 'ext') { b.why += ' Extension of 1h requested.'; L(b.who, 'Extension', `#${b.id} +1h, awaiting owner`); }
  if (k === 'out') { b.status = 'active'; b.before = note || 'Good'; b.why = `Checked out. Condition before use: ${b.before}.`; L('Owner', 'Check-out', `#${b.id} condition: ${b.before}`, 'g'); }
  if (k === 'dmg') { b.dmg = true; b.why += ' Damage reported.'; L('Owner', 'Damage report', `#${b.id} ${note || 'details pending'}`, 'r'); }
  if (k === 'back') { b.status = 'returned'; b.after = note || 'Good'; b.why = `Returned. Before: ${b.before}, after: ${b.after}.`; S.usage[b.who] = (S.usage[b.who] || 0) + 2; L('Owner', 'Return confirmed', `#${b.id} after: ${b.after}`, 'g'); if (b.after !== b.before) L('System', 'Incident', `#${b.id} condition changed ${b.before} → ${b.after}; deposit review opened`, 'r'); }

  save();
  res.json({ ok: true, booking: b });
});

/* ---------- static (production) ---------- */
const dist = path.join(dir, '../dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ShareSpace API on :${PORT}`));
