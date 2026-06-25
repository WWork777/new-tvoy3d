// Drop-in replacement for the Supabase client.
// Talks to the self-hosted tvoy3d-api (Node + SQLite) instead of Supabase.
// Implements only the surface used across the app: auth, from()-query-builder,
// storage and a no-op realtime channel.

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";
const STORAGE_KEY = "tvoy3d_auth";

type StoredAuth = { access_token: string; user: { id: string; email: string } };

function readAuth(): StoredAuth | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}
function writeAuth(a: StoredAuth | null) {
  if (typeof localStorage === "undefined") return;
  if (a) localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  else localStorage.removeItem(STORAGE_KEY);
}
function authHeader(): Record<string, string> {
  const a = readAuth();
  return a ? { Authorization: `Bearer ${a.access_token}` } : {};
}
function sessionFromAuth(a: StoredAuth | null): any {
  if (!a) return null;
  return { access_token: a.access_token, user: a.user };
}

// ---------------- auth ----------------
type AuthListener = (event: string, session: any) => void;
const listeners = new Set<AuthListener>();
function emit(event: string) {
  const session = sessionFromAuth(readAuth());
  listeners.forEach((cb) => {
    try { cb(event, session); } catch { /* ignore */ }
  });
}

const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) return { data: { session: null, user: null }, error: { message: j?.error?.message || "Ошибка входа" } };
      writeAuth({ access_token: j.access_token, user: j.user });
      emit("SIGNED_IN");
      return { data: { session: sessionFromAuth(readAuth()), user: j.user }, error: null };
    } catch (e: any) {
      return { data: { session: null, user: null }, error: { message: e?.message || "Сеть недоступна" } };
    }
  },

  async getSession() {
    return { data: { session: sessionFromAuth(readAuth()) }, error: null };
  },

  async getUser() {
    const a = readAuth();
    return { data: { user: a?.user ?? null }, error: null };
  },

  onAuthStateChange(cb: AuthListener) {
    listeners.add(cb);
    // fire current state asynchronously, like supabase-js
    setTimeout(() => {
      try { cb("INITIAL_SESSION", sessionFromAuth(readAuth())); } catch { /* ignore */ }
    }, 0);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },

  async signOut() {
    writeAuth(null);
    emit("SIGNED_OUT");
    return { error: null };
  },

  // Used server-side by requireSupabaseAuth; decode JWT payload without verifying.
  async getClaims(token: string) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { data: { claims: payload }, error: null };
    } catch (e: any) {
      return { data: null, error: { message: "Invalid token" } };
    }
  },
};

// ---------------- query builder ----------------
type Filter = { col: string; op: string; val: any };

class QueryBuilder implements PromiseLike<any> {
  private table: string;
  private action: "select" | "insert" | "upsert" | "update" | "delete" = "select";
  private _columns = "*";
  private _filters: Filter[] = [];
  private _order: { col: string; asc: boolean } | null = null;
  private _single = false;
  private _count = false;
  private _head = false;
  private _values: any = null;
  private _rows: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, opts?: { count?: string; head?: boolean }) {
    if (this.action === "select") {
      this._columns = columns || "*";
      if (opts?.count) this._count = true;
      if (opts?.head) this._head = true;
    }
    return this;
  }
  insert(rows: any) { this.action = "insert"; this._rows = rows; return this; }
  upsert(rows: any) { this.action = "upsert"; this._rows = rows; return this; }
  update(values: any) { this.action = "update"; this._values = values; return this; }
  delete() { this.action = "delete"; return this; }
  eq(col: string, val: any) { this._filters.push({ col, op: "eq", val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this._order = { col, asc: opts?.ascending !== false };
    return this;
  }
  maybeSingle() { this._single = true; return this; }
  single() { this._single = true; return this; }
  limit() { return this; }

  private async run() {
    const body: any = {
      table: this.table,
      action: this.action,
      columns: this._columns,
      filters: this._filters,
      order: this._order,
      single: this._single,
      count: this._count,
      head: this._head,
      values: this._values,
      rows: this._rows,
    };
    try {
      const r = await fetch(`${API_BASE}/q`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) return { data: this._single ? null : [], count: null, error: { message: j?.error?.message || "Ошибка запроса" } };
      return j;
    } catch (e: any) {
      return { data: this._single ? null : [], count: null, error: { message: e?.message || "Сеть недоступна" } };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled as any, onrejected as any);
  }
}

// ---------------- storage ----------------
function storageFrom(_bucket: string) {
  return {
    async upload(filePath: string, file: File, _opts?: any) {
      try {
        const fd = new FormData();
        fd.append("path", filePath);
        fd.append("file", file);
        const r = await fetch(`${API_BASE}/storage/upload`, {
          method: "POST",
          headers: { ...authHeader() },
          body: fd,
        });
        const j = await r.json();
        if (!r.ok) return { data: null, error: { message: j?.error?.message || "Ошибка загрузки" } };
        return { data: j.data, error: null };
      } catch (e: any) {
        return { data: null, error: { message: e?.message || "Сеть недоступна" } };
      }
    },
    getPublicUrl(filePath: string) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return { data: { publicUrl: `${origin}/uploads/${filePath}` } };
    },
  };
}

// ---------------- realtime (no-op stub) ----------------
function makeChannel() {
  const ch: any = {
    on() { return ch; },
    subscribe() { return ch; },
    unsubscribe() { return ch; },
  };
  return ch;
}

export const supabase: any = {
  auth,
  from: (table: string) => new QueryBuilder(table),
  storage: { from: storageFrom },
  channel: (_name: string) => makeChannel(),
  removeChannel: (_ch: any) => {},
};
