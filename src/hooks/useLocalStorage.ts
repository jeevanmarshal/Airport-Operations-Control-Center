import { useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/localStorage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getItem(key, initialValue);
  });

  useEffect(() => {
    setItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
