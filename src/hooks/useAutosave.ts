import { useEffect, useRef } from 'react';

interface AutosaveOptions {
  key: string;
  data: any;
  delay?: number;
}

export const useAutosave = ({ key, data, delay = 2000 }: AutosaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);
};

export const loadAutosave = <T>(key: string): T | null => {
  try {
    const saved = localStorage.getItem(`autosave_${key}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const clearAutosave = (key: string) => {
  localStorage.removeItem(`autosave_${key}`);
};
