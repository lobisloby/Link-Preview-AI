// src/shared/hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';

type StorageArea = 'local' | 'sync';

export function useStorage<T>(
  key: string,
  defaultValue: T,
  area: StorageArea = 'local'
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  const storage = chrome.storage[area];

  useEffect(() => {
    storage.get(key, (result) => {
      if (result[key] !== undefined) {
        setValue(result[key] as T);
      }
      setLoading(false);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key]) {
        setValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key, area, storage]);

  const setStoredValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      await storage.set({ [key]: valueToStore });
      setValue(valueToStore);
    },
    [key, value, storage]
  );

  return [value, setStoredValue, loading];
}

export async function getStorageValue<T>(
  key: string,
  defaultValue: T,
  area: StorageArea = 'local'
): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage[area].get(key, (result) => {
      resolve((result[key] as T) ?? defaultValue);
    });
  });
}

export async function setStorageValue<T>(
  key: string,
  value: T,
  area: StorageArea = 'local'
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage[area].set({ [key]: value }, resolve);
  });
}