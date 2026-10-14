/** Title data is cached for seven days (R5.2). */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

export class MemoryCache implements Cache {
  private items = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  async get<T>(key: string) {
    const item = this.items.get(key);
    if (!item) return undefined;
    if (item.expiresAt <= this.now()) {
      this.items.delete(key);
      return undefined;
    }
    return structuredClone(item.value) as T;
  }

  async set<T>(key: string, value: T, ttlMs: number) {
    this.items.set(key, { value: structuredClone(value), expiresAt: this.now() + ttlMs });
  }
}

export async function cached<T>(cache: Cache | undefined, key: string, load: () => Promise<T>, ttlMs = SEVEN_DAYS_MS) {
  if (!cache) return load();
  const hit = await cache.get<T>(key);
  if (hit !== undefined) return hit;
  const value = await load();
  await cache.set(key, value, ttlMs);
  return value;
}
