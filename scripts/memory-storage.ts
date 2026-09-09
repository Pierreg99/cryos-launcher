/**
 * Minimal in-memory Storage shim — lets the persisted store (and its
 * `persist` API) run headlessly in Node for `npm run smoke`.
 * Must be imported before the store module.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

const g = globalThis as { localStorage?: Storage };
if (typeof g.localStorage === "undefined") {
  g.localStorage = new MemoryStorage();
}

export {};
