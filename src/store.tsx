import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import resources from '../shared/resources.json';

export type Cert = 'id' | 't3d' | 'hv' | 'sup';
export const CERTS: Record<Cert, string> = {
  id: 'Verified institutional ID',
  t3d: '3D printer safety training',
  hv: 'High-voltage induction',
  sup: 'Supervisor sign-off',
};

export interface Res {
  id: string;
  name: string;
  cat: string;
  owner: string;
  desc: string;
  req: Cert[];
  dep: number;
  sup: boolean;
  cap: number;
  slots: string[];
  grad: string;
  img: string;
}

export type St = 'pending' | 'approved' | 'active' | 'returned' | 'rejected' | 'cancelled' | 'waitlisted';
export interface Bk {
  id: number;
  rid: string;
  slot: string;
  who: string;
  purpose: string;
  status: St;
  why: string;
  before?: string;
  after?: string;
  dmg?: boolean;
}
export interface Ev {
  t: string;
  actor: string;
  action: string;
  detail: string;
  tone: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'owner';
}

export const RES = resources as unknown as Res[];

interface S {
  user: User | null;
  certs: Record<Cert, boolean>;
  bks: Bk[];
  log: Ev[];
  usage: Record<string, number>;
}

export type Role = 'user' | 'owner';

interface Ctx extends S {
  role: Role;
  setRole: (r: Role) => void;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  toggleCert: (c: Cert) => Promise<void>;
  busy: (rid: string, s: string) => Bk | undefined;
  wait: (rid: string, s: string) => Bk[];
  submit: (rid: string, slot: string, purpose: string) => Promise<{ ok: boolean; msg: string }>;
  act: (k: string, id: number, note?: string) => Promise<string | void>;
  reset: () => Promise<void>;
}

const C = createContext<Ctx>(null!);
export const useApp = () => useContext(C);

/* ---------- API helper ---------- */
async function api<T = any>(url: string, token?: string | null, body?: object, role?: Role): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers['authorization'] = 'Bearer ' + token;
  if (role) headers['x-role'] = role;
  const r = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err: any = new Error(data.error || data.msg || `Request failed (${r.status})`);
    err.status = r.status;
    throw err;
  }
  return data;
}

export function Provider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('ss_view_role') as Role;
    return saved === 'owner' || saved === 'user' ? saved : 'user';
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ss_token'));
  const [s, setS] = useState<S | null>(null);
  const [, setAuthError] = useState<string | null>(null);
  const hasInitRole = useRef(false);

  const setRole = (r: Role) => {
    localStorage.setItem('ss_view_role', r);
    setRoleState(r);
  };

  const refresh = useCallback(async () => {
    if (!token) {
      setS({ user: null, certs: { id: true, t3d: false, hv: false, sup: false }, bks: [], log: [], usage: {} });
      return;
    }
    try {
      const data = await api<S>('/api/state', token, undefined, role);
      setS(data);
      setAuthError(null);
      if (data.user && !hasInitRole.current) {
        hasInitRole.current = true;
        const saved = localStorage.getItem('ss_view_role') as Role;
        if (!saved) {
          setRole(data.user.role);
        }
      }
    } catch (err: any) {
      if (err.status === 401) {
        // token invalid/expired — clear it
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_view_role');
        setToken(null);
        setS({ user: null, certs: { id: true, t3d: false, hv: false, sup: false }, bks: [], log: [], usage: {} });
      }
    }
  }, [token, role]);

  useEffect(() => {
    refresh();
    if (!token) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh, token]);

  const login = async (email: string, password: string) => {
    try {
      const r = await api<{ token: string; user: User }>('/api/auth/login', null, { email, password });
      localStorage.setItem('ss_token', r.token);
      setToken(r.token);
      setRole(r.user.role);
      hasInitRole.current = true;
      await refresh();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  };

  const register = async (name: string, email: string, password: string, r: Role) => {
    try {
      const res = await api<{ token: string; user: User }>('/api/auth/register', null, { name, email, password, role: r });
      localStorage.setItem('ss_token', res.token);
      setToken(res.token);
      setRole(res.user.role);
      hasInitRole.current = true;
      await refresh();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  };

  const logout = () => {
    if (token) {
      api('/api/auth/logout', token, {}, role).catch(() => {});
    }
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_view_role');
    setToken(null);
    setRoleState('user');
    hasInitRole.current = false;
    setS({ user: null, certs: { id: true, t3d: false, hv: false, sup: false }, bks: [], log: [], usage: {} });
  };

  if (!s) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-brand-500" />
          Loading ShareSpace…
        </div>
      </div>
    );
  }

  const ACT = ['pending', 'approved', 'active'];
  const busy = (rid: string, sl: string) => s.bks.find((b) => b.rid === rid && b.slot === sl && ACT.includes(b.status));
  const wait = (rid: string, sl: string) =>
    s.bks.filter((b) => b.rid === rid && b.slot === sl && b.status === 'waitlisted').sort((a, b) => s.usage[a.who] - s.usage[b.who] || a.id - b.id);

  return (
    <C.Provider
      value={{
        ...s,
        role,
        setRole,
        token,
        login,
        register,
        logout,
        busy,
        wait,
        toggleCert: async (c) => {
          try {
            await api('/api/certs/' + c, token, {}, role);
            await refresh();
          } catch (err: any) {
            console.error('Failed to toggle certification:', err);
          }
        },
        submit: async (rid, slot, purpose) => {
          try {
            const r = await api('/api/bookings', token, { rid, slot, purpose }, role);
            await refresh();
            return { ok: !!r.ok, msg: r.msg || r.error || 'Request sent successfully.' };
          } catch (err: any) {
            return { ok: false, msg: err.message || 'Failed to submit request.' };
          }
        },
        act: async (k, id, note = '') => {
          try {
            const r = await api(`/api/bookings/${id}/${k}`, token, { note }, role);
            await refresh();
            return r.error;
          } catch (err: any) {
            return err.message || 'Action failed.';
          }
        },
        reset: async () => {
          try {
            await api('/api/reset', token, {}, role);
            await refresh();
          } catch (err: any) {
            console.error('Failed to reset demo data:', err);
            throw err;
          }
        },
      }}
    >
      {children}
    </C.Provider>
  );
}
