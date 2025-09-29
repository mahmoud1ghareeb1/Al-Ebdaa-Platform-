type CacheEntry<T> = { v: T; e: number };

const PREFIX = 'alibdaa-cache:';

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed.e && Date.now() > parsed.e) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed.v;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = 1000 * 60 * 60 * 24 * 7) {
  try {
    const entry: CacheEntry<T> = { v: value, e: Date.now() + ttlMs };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

export async function cacheGetOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;
  const v = await fetcher();
  cacheSet(key, v, ttlMs);
  return v;
}
