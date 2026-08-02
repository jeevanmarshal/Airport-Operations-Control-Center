export const STORAGE_VERSION = '1.0.0';
export const STORAGE_PREFIX = 'aocc_';

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(getStorageKey(key));
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed.version !== STORAGE_VERSION) {
      window.localStorage.removeItem(getStorageKey(key));
      return fallback;
    }
    return parsed.value as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    const payload = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      value,
    };
    window.localStorage.setItem(getStorageKey(key), JSON.stringify(payload));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export function clear(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
