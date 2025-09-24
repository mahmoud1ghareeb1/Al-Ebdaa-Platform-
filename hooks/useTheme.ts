import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

export type Theme = 'light' | 'dark';

// Determines the initial theme based on localStorage or system preference.
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// --- Global State and Logic (outside React's lifecycle) ---

let currentTheme: Theme = getInitialTheme();
// FIX: Import Dispatch and SetStateAction types from React to resolve namespace error.
const listeners = new Set<Dispatch<SetStateAction<Theme>>>();

/**
 * Toggles the theme between 'light' and 'dark', applies it to the DOM and
 * localStorage, and notifies all subscribed components of the change.
 */
export const toggleTheme = () => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  currentTheme = newTheme;

  // 1. Update the DOM
  const root = window.document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Update localStorage for persistence
  localStorage.setItem('theme', newTheme);
  
  // 3. Notify all listening React components to re-render with the new theme
  listeners.forEach(listener => listener(newTheme));
};

// --- Custom Hook for React Components ---

/**
 * A custom hook that allows components to access the current theme and
 * automatically re-render when the theme changes.
 * @returns The current theme ('light' or 'dark').
 */
export const useTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    // Subscribe the component's state updater to the global listener set
    listeners.add(setTheme);
    
    // On cleanup, unsubscribe to prevent memory leaks
    return () => {
      listeners.delete(setTheme);
    };
  }, []); // Effect runs only once on mount and cleanup on unmount

  return theme;
};
