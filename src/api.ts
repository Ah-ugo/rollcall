export const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const WS = API.replace(/^http/, "ws");

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) { super(message); this.code = code; }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: any; raw?: boolean } = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(API + path, {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers: { ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 && token && !path.startsWith("/auth")) {
    localStorage.removeItem("token"); window.location.href = "/login";
  }
  if (!res.ok) {
    let d: any = {};
    try { d = await res.json(); } catch {}
    const det = d.detail;
    if (typeof det === "string") throw new ApiError(det);
    if (Array.isArray(det)) throw new ApiError(det.map((e: any) => e.msg).join(", "));
    throw new ApiError(det?.message || "Something went wrong", det?.code);
  }
  return (opts.raw ? res : res.json()) as Promise<T>;
}

export async function download(path: string, filename: string) {
  const res: Response = await api(path, { raw: true });
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const fmt = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
export const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
